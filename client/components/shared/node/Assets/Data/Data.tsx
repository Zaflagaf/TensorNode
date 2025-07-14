"use client";

import Handle from "@/components/shared/handle/Handle";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import layers from "@/public/layers.svg";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { ExcelDropzone } from "../../Layout/Dropzone/Dropzone";
import NodeHeader from "../../Layout/Header/NodeHeader";
import Node from "../../Node";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFlowContext } from "@/context/FlowContext";
import { NodeSelect } from "../../Layout/Select/Select";

function standardization(array: number[]) {
  const n = array.length;
  const mean = array.reduce((acc, val) => acc + val, 0) / n;
  const standard_deviation = Math.sqrt(
    array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n
  );
  const z = array.map((val) => (val - mean) / standard_deviation);
  return z;
}
function normalization(array: number[]) {
  const min = Math.min(...array);
  const max = Math.max(...array);
  const z = array.map((val) => (val - min) / (max - min));

  return z;
}

export function DataNodeComponent({
  id,
  position,
  label,
  values,
}: {
  id: string;
  position: { x: number; y: number };
  label: string;
  values: any;
}) {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [featuresData, setFeaturesData] = useState<any[]>([]);
  const [labelsData, setLabelsData] = useState<any[]>([]);
  const { updateNode, nodes } = useFlowContext();

  const parseExcel = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet);
    setExcelData(json);
    setSelectedFeatures([]);
    setSelectedLabels([]);
  };

  const getTableHeaders = (): string[] => {
    if (excelData.length === 0) return [];
    return Object.keys(excelData[0]);
  };

  const toggleFeature = (header: string) => {
    setSelectedFeatures((prev) => {
      // If already selected, remove it
      if (prev.includes(header)) {
        return prev.filter((h) => h !== header);
      }
      // If it's in labels, remove from labels first
      if (selectedLabels.includes(header)) {
        setSelectedLabels((prev) => prev.filter((h) => h !== header));
      }
      // Add to features
      return [...prev, header];
    });
  };

  const toggleLabel = (header: string) => {
    setSelectedLabels((prev) => {
      // If already selected, remove it
      if (prev.includes(header)) {
        return prev.filter((h) => h !== header);
      }
      // If it's in features, remove from features first
      if (selectedFeatures.includes(header)) {
        setSelectedFeatures((prev) => prev.filter((h) => h !== header));
      }
      // Add to labels
      return [...prev, header];
    });
  };

  // Update features and labels data whenever selections or excel data changes
  useEffect(() => {
    if (excelData.length === 0) return;

    // Extract only the selected features from the data
    const features = excelData.map((row) => {
      const featureRow: Record<string, any> = {};
      selectedFeatures.forEach((header) => {
        featureRow[header] = row[header];
      });
      return featureRow;
    });
    setFeaturesData(features);

    // Extract only the selected labels from the data
    const labels = excelData.map((row) => {
      const labelRow: Record<string, any> = {};
      selectedLabels.forEach((header) => {
        labelRow[header] = row[header];
      });
      return labelRow;
    });
    setLabelsData(labels);
  }, [excelData, selectedFeatures, selectedLabels]);

  useEffect(() => {
    updateNode(id, "values.output.features", featuresData.map((obj) => Object.values(obj)));
  }, [featuresData]);

  useEffect(() => {
    updateNode(id, "values.output.labels", labelsData.map((obj) => Object.values(obj)));
  }, [labelsData]);

  return (
    <Node id={id} defaultPosition={position}>
      <div className="data" id={id}>
        <NodeHeader label={label} id={id} logo={layers} />
        <div
          className="dense-body"
          style={{ display: "flex", flexDirection: "column", gap: "5px" }}
        >
          {/*
          <NodeSelect
            id="h5"
            label="Data file"
            choice={dataChoice}
            placeholder={"Select Data"}
            type="target"
          />*/}
          <Handle type="source" id="data-h1" dataId="features">
            Features{" "}
            {selectedFeatures.length > 0 && `(${selectedFeatures.length})`}
          </Handle>
          <Handle type="source" id="data-h2" dataId="labels">
            Labels {selectedLabels.length > 0 && `(${selectedLabels.length})`}
          </Handle>
          <div className="px-[20px] py-[10px]">
            <ExcelDropzone onFileDrop={parseExcel} />
          </div>
        </div>

        {excelData.length > 0 && (
          <div className="px-[20px] mb-4">
            <div className="flex flex-wrap gap-2 my-3">
              <div className="text-sm font-medium">Selected Features:</div>
              {selectedFeatures.length > 0 ? (
                selectedFeatures.map((feature) => (
                  <Badge key={feature} variant="outline" className="bg-blue-50">
                    {feature}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No features selected
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="text-sm font-medium">Selected Labels:</div>
              {selectedLabels.length > 0 ? (
                selectedLabels.map((label) => (
                  <Badge key={label} variant="outline" className="bg-green-50">
                    {label}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No labels selected
                </span>
              )}
            </div>
          </div>
        )}

        <div className="px-[20px]">
          <div className="mt-2 overflow-hidden border border-gray-200 shadow-sm rounded-2xl undraggable">
            <ScrollArea className="h-[300px]">
              <Table className="min-w-full bg-white">
                <TableCaption className="p-4 text-sm text-muted-foreground">
                  Excel Data - Select columns for features and labels
                </TableCaption>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    {getTableHeaders().map((header) => (
                      <TableHead
                        key={header}
                        className="text-gray-600 text-left text-sm sticky top-0 bg-gray-100 z-10 px-4 min-w-[120px] align-top"
                      >
                        <div className="flex flex-col gap-2 py-2">
                          <span className="font-medium">{header}</span>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`feature-${header}`}
                                checked={selectedFeatures.includes(header)}
                                onCheckedChange={() => toggleFeature(header)}
                                className="border-blue-500 data-[state=checked]:bg-blue-500 h-4 w-4"
                              />
                              <label
                                htmlFor={`feature-${header}`}
                                className="text-xs font-medium text-blue-600"
                              >
                                Feature
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`label-${header}`}
                                checked={selectedLabels.includes(header)}
                                onCheckedChange={() => toggleLabel(header)}
                                className="border-green-500 data-[state=checked]:bg-green-500 h-4 w-4"
                              />
                              <label
                                htmlFor={`label-${header}`}
                                className="text-xs font-medium text-green-600"
                              >
                                Label
                              </label>
                            </div>
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excelData.map((row, index) => (
                    <TableRow
                      key={index}
                      className="transition-colors hover:bg-gray-50"
                    >
                      {getTableHeaders().map((header) => (
                        <TableCell
                          key={header}
                          className={`text-sm ${
                            selectedFeatures.includes(header)
                              ? "bg-blue-50"
                              : selectedLabels.includes(header)
                              ? "bg-green-50"
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
        <div
          className="data-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
          }}
        />
      </div>
    </Node>
  );
}

export default DataNodeComponent;
