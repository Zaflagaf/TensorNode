"use client";

import { Badge } from "@/frontend/components/ui/shadcn/badge";
import { Checkbox } from "@/frontend/components/ui/shadcn/checkbox";
import { ScrollArea } from "@/frontend/components/ui/shadcn/scroll-area";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/shadcn/table";
import useLayout from "@/frontend/hooks/useLayout";
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import { Node } from "@/frontend/types";
import WorkflowNode from "@/frontend/organism/node/Node";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";
import { ExcelDropzone } from "../../layout/Dropzone/Dropzone";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";

export default function ExcelNodeComponent({ node }: { node: Node }) {
  const [excelData, setExcelData] = useState<any[]>(
    node.content.ports.inputs["in-data"].value ?? []
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    node.content.ports.inputs["in-selectedFeatures"].value ?? []
  );
  const [selectedLabels, setSelectedLabels] = useState<string[]>(
    node.content.ports.inputs["in-selectedLabels"].value ?? []
  );

  const setNodeOutput = useNodesStore((s) => s.actions.setNodeOutput);
  
  const extractValues = (keys: string[]) =>
    excelData.map((row) => keys.map((k) => row[k]));

  useLayout(node, {
    "in-data": excelData,
    "in-selectedFeatures": selectedFeatures,
    "in-selectedLabels": selectedLabels,
    "in-features": extractValues(selectedFeatures),
    "in-labels": extractValues(selectedLabels),
  });

  const parseExcel = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);
    setExcelData(json);
    setSelectedFeatures([]);
    setSelectedLabels([]);
  };

  const headers = useMemo(
    () => (excelData[0] ? Object.keys(excelData[0]) : []),
    [excelData]
  );

  const toggleSelection = (header: string, type: "feature" | "label") => {
    const [current, other, setCurrent, setOther] =
      type === "feature"
        ? [
            selectedFeatures,
            selectedLabels,
            setSelectedFeatures,
            setSelectedLabels,
          ]
        : [
            selectedLabels,
            selectedFeatures,
            setSelectedLabels,
            setSelectedFeatures,
          ];

    if (current.includes(header))
      return setCurrent((prev) => prev.filter((h) => h !== header));
    if (other.includes(header))
      setOther((prev) => prev.filter((h) => h !== header));
    setCurrent((prev) => [...prev, header]);
  };



  useEffect(() => {
    setNodeOutput(node.id, "out-features", extractValues(selectedFeatures));
  }, [selectedFeatures, excelData]);
  useEffect(() => {
    setNodeOutput(node.id, "out-labels", extractValues(selectedLabels));
  }, [selectedLabels, excelData]);

  const renderBadges = (items: string[], title: string) => (
    <div className="flex flex-wrap gap-2 my-3">
      <div className="text-sm font-medium text-node-text">{title}:</div>
      {items.length > 0 ? (
        items.map((i) => (
          <Badge
            key={i}
            variant="outline"
            className="bg-node-vz-line border-node-vz-outline text-node-text"
          >
            {i}
          </Badge>
        ))
      ) : (
        <span className="text-sm text-node-text">None selected</span>
      )}
    </div>
  );

  return (
    <WorkflowNode node={node}>
      <WorkflowHead label={node.content.name} className="bg-hue-130" />
      <WorkflowBody>
        {["out-features", "out-labels"].map((handleId, idx) => (
          <WorkflowHandle
            key={handleId}
            type="source"
            handleId={handleId}
            node={node}
          >
            <WorkflowDefault
              label={`${handleId === "out-features" ? "Features" : "Labels"} ${
                (handleId === "out-features"
                  ? selectedFeatures.length
                  : selectedLabels.length) || ""
              }`}
            />
          </WorkflowHandle>
        ))}
        <ExcelDropzone onFileDrop={parseExcel} />

        {excelData.length > 0 && (
          <>
            <div>
              {renderBadges(selectedFeatures, "Selected Features")}
              {renderBadges(selectedLabels, "Selected Labels")}
            </div>

            <div className="undraggable">
              <div className="mt-2 overflow-hidden border border-node-vz-outline shadow-sm rounded-[4px] undraggable">
                <ScrollArea className="flex min-w-52 undraggable">
                  <Table className="min-w-full bg-node-vz">
                    <TableHeader>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHead
                            key={header}
                            className="text-node-text text-left text-sm sticky top-0 bg-node-vz-line z-10 px-4 min-w-[120px] align-top"
                          >
                            <div className="flex flex-col gap-2 py-2">
                              <span className="font-medium">{header}</span>
                              {["feature", "label"].map((type) => (
                                <div
                                  key={type}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`${type}-${header}`}
                                    checked={
                                      type === "feature"
                                        ? selectedFeatures.includes(header)
                                        : selectedLabels.includes(header)
                                    }
                                    onCheckedChange={() =>
                                      toggleSelection(
                                        header,
                                        type as "feature" | "label"
                                      )
                                    }
                                    className="border-node-vz-outline data-[state=checked]:bg-node-vz data-[state=checked]:border-node-vz-activ h-4 w-4"
                                  />
                                  <label
                                    htmlFor={`${type}-${header}`}
                                    className="text-xs font-medium text-node-text"
                                  >
                                    {type[0].toUpperCase() + type.slice(1)}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {excelData.map((row, idx) => (
                        <TableRow
                          key={idx}
                          className="transition-colors hover:bg-node-vz-line border-node-vz-line"
                        >
                          {headers.map((header) => (
                            <TableCell
                              key={header}
                              className={`text-sm text-node-text ${
                                selectedFeatures.includes(header) ||
                                selectedLabels.includes(header)
                                  ? "bg-node-input-focus"
                                  : ""
                              }`}
                            >
                              {row[header]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          </>
        )}
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
