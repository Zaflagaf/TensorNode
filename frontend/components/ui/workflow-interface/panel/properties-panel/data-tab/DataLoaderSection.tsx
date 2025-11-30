"use client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/frontend/components/ui/shadcn/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/frontend/components/ui/shadcn/sidebar";
import { specifyCSVCol, uploadFile } from "@/frontend/lib/fetch/api";
import { Layer } from "@/frontend/types";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/shallow";
import InputProperties from "../layouts/Input";
import useDataStore, { DatasetData } from "./data-store";

export default function DataLoaderSection({ layer }: { layer: Layer }) {
  return (
    <CollapsibleContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <LargeCSVFeatureSummary />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </CollapsibleContent>
  );
}

type ColumnType = "Feature" | "Label" | "None";

export function LargeCSVFeatureSummary() {
  const {
    datasets,
    selectedDataset,
    searchTerm,
    addDataset,
    selectDataset,
    setSearchTerm,
    updateColumnType,
  } = useDataStore(
    useShallow((state) => ({
      datasets: state.datasets,
      selectedDataset: state.selectedDataset,
      searchTerm: state.searchTerm,
      addDataset: state.addDataset,
      selectDataset: state.selectDataset,
      setSearchTerm: state.setSearchTerm,
      updateColumnType: state.updateColumnType,
    }))
  );
  const [fileName, setFileName] = useState<string>();

  const currentData: DatasetData | undefined = selectedDataset ? datasets[selectedDataset] : undefined;
  const summary = currentData?.summary;
  const columnTypes = currentData?.columnTypes || {};

  useEffect(() => {
    if (!fileName || !columnTypes) return
    specifyCSVCol(fileName, columnTypes)
  }, [fileName, columnTypes]);


  async function upload(file: File) {
    uploadFile(file);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    upload(file);
    setFileName(file.name)

    const CHUNK_SIZE = 1024 * 1024; // 1 Mo
    const decoder = new TextDecoder("utf-8");
    let offset = 0;
    let headers: string[] = [];
    const sampleValues: Record<string, Set<string>> = {};
    let leftover = "";
    let rowCount = 0;

    const reader = new FileReader();

    const detectSeparator = (line: string) => {
      const candidates = [",", ";", "\t", "|"];
      let maxCount = 0;
      let sep = ",";
      candidates.forEach((s) => {
        const count = line.split(s).length;
        if (count > maxCount) {
          maxCount = count;
          sep = s;
        }
      });
      return sep;
    };

    reader.onload = (event) => {
      const text =
        leftover +
        decoder.decode(event.target?.result as ArrayBuffer, { stream: true });
      const lines = text.split(/\r?\n/);
      leftover = lines.pop() || "";

      lines.forEach((line) => {
        if (!line.trim()) return;
        const separator = detectSeparator(line);
        const values = line.split(separator).map((v) => v.trim());

        if (headers.length === 0) {
          const allNumbers = values.every((v) => !isNaN(Number(v)));
          headers = allNumbers
            ? values.map((_, i) => `Feature_${i + 1}`)
            : values;
          headers.forEach((h) => (sampleValues[h] = new Set()));
        } else {
          headers.forEach((h, i) => {
            if (sampleValues[h].size < 5) sampleValues[h].add(values[i] ?? "");
          });
        }
        rowCount++;
      });

      offset += CHUNK_SIZE;
      if (
        offset < file.size &&
        Object.values(sampleValues).some((s) => s.size < 5)
      ) {
        readChunk();
      } else {
        const sampleValuesArray: Record<string, string[]> = {};
        headers.forEach((h) => {
          sampleValuesArray[h] = Array.from(sampleValues[h]);
        });

        addDataset(file.name, {
          summary: {
            columns: headers,
            sampleValues: sampleValuesArray,
            rowCount,
          },
          columnTypes: headers.reduce(
            (acc, h) => ({ ...acc, [h]: "None" as ColumnType }),
            {}
          ),
        });

        selectDataset(file.name);
      }
    };

    reader.onerror = () => console.error("Erreur lecture fichier");

    const readChunk = () => {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    readChunk();
  };

  const handleTypeChange = (col: string, type: ColumnType) => {
    updateColumnType(col, type);
  };

  // Créer un résumé Feature / Label
  const featureSummary = useMemo(() => {
    if (!currentData) return { Feature: [], Label: [] };
    const features = Object.entries(columnTypes)
      .filter(([_, type]) => type === "Feature")
      .map(([col]) => col);
    const labels = Object.entries(columnTypes)
      .filter(([_, type]) => type === "Label")
      .map(([col]) => col);

    return { Feature: features, Label: labels };
  }, [currentData, columnTypes]);

  return (
    <div className="flex flex-col gap-2">
      <InputProperties
        label="Add CSV"
        type="file"
        accept=".csv"
        placeholder="add CSV"
        onChange={handleFileChange}
      />

      {Object.keys(datasets).length > 0 && (
        <select
          value={selectedDataset || ""}
          onChange={(e) => selectDataset(e.target.value)}
          className="p-1 rounded-xs bg-accent"
        >
          {Object.keys(datasets).map((name) => (
            <option key={name} value={name} className="rounded-xs">
              {name}
            </option>
          ))}
        </select>
      )}

      {summary && (
        <div className="flex flex-col gap-0">
          <input
            type="text"
            placeholder="Search characteristics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-1 rounded-t-xs w-full flex focus:outline-none bg-background focus:ring-0"
          />

          <ul className="bg-background rounded-b-xs p-1 flex flex-col gap-0.5 overflow-y-scroll max-h-80">
            {summary.columns
              .filter((col) =>
                col.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((col) => (
                <Collapsible key={col}>
                  <CollapsibleTrigger className="w-full">
                    <li className="bg-accent/75 rounded-xs px-1 py-0.5 flex w-full justify-between items-center">
                      <span>{col}</span>
                      <select
                        value={columnTypes[col]}
                        onChange={(e) =>
                          handleTypeChange(col, e.target.value as ColumnType)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="text-xxs bg-accent text-foreground rounded-xs"
                      >
                        <option value="None">None</option>
                        <option value="Feature">Feature</option>
                        <option value="Label">Label</option>
                      </select>
                    </li>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {summary.sampleValues[col].length > 0 && (
                      <ul className="flex flex-col gap-px h-fit">
                        {summary.sampleValues[col].map((item) => (
                          <li
                            key={item}
                            className="bg-accent/25 rounded-xs p-1 flex w-full text-muted-foreground"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              ))}
          </ul>

          {/* Résumé Feature / Label */}
          <div className="rounded-xs bg-background border border-border mt-1 p-1 text-xxs">
            <p>
              Features ({featureSummary.Feature.length}):{" "}
              {featureSummary.Feature.join(", ")}
            </p>
            <p>
              Labels ({featureSummary.Label.length}):{" "}
              {featureSummary.Label.join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
