"use client";

import { Badge } from "@/frontend/components/ui/badge";
import { Checkbox } from "@/frontend/components/ui/checkbox";
import { ScrollArea } from "@/frontend/components/ui/scroll-area";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";

import { ExcelDropzone } from "../../layout/Dropzone/Dropzone";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import type { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";

/* function standardization(array: number[]) {
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
} */

export function DataNodeComponent({ node }: { node: NodeType }) {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [featuresData, setFeaturesData] = useState<any[]>([]);
  const [labelsData, setLabelsData] = useState<any[]>([]);

  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);

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
    const data = featuresData.map((obj) => Object.values(obj));
    const features = data.map((obj: any) => Object.values(obj));
    setNodeOutput(node.id, "features", features);
  }, [featuresData]);

  useEffect(() => {
    const data = labelsData.map((obj) => Object.values(obj));
    const labels = data.map((obj: any) =>
      Object.values(obj)
    );
    setNodeOutput(node.id, "labels", labels);
  }, [labelsData]);

  return (
    <WorkflowNode node={node}>
      <div>
        <WorkflowHead
          label={"Data"}
          className={"from-node-head-data-from-gradient to-node-head-data-to-gradient"}
        />
        <WorkflowBody>
          <WorkflowHandle type="source" id="h1" port="features" node={node}>
            <WorkflowDefault
              label={`Features ${
                selectedFeatures.length > 0
                  ? `[${selectedFeatures.length}]`
                  : ""
              }`}
            />
          </WorkflowHandle>
          <WorkflowHandle type="source" id="h2" port="labels" node={node}>
            <WorkflowDefault
              label={`Labels ${
                selectedLabels.length > 0 ? `[${selectedLabels.length}]` : ""
              }`}
            />
          </WorkflowHandle>
          <ExcelDropzone onFileDrop={parseExcel} />
        </WorkflowBody>

        {excelData.length > 0 && (
          <div className="px-[20px] mb-4">
            <div className="flex flex-wrap gap-2 my-3">
              <div className="text-sm font-medium text-node-text">
                Selected Features:
              </div>
              {selectedFeatures.length > 0 ? (
                selectedFeatures.map((feature) => (
                  <Badge
                    key={feature}
                    variant="outline"
                    className="bg-node-vz-line border-node-vz-outline text-node-text"
                  >
                    {feature}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-node-text">
                  No features selected
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="text-sm font-medium text-node-text">
                Selected Labels:
              </div>
              {selectedLabels.length > 0 ? (
                selectedLabels.map((label) => (
                  <Badge
                    key={label}
                    variant="outline"
                    className="bg-node-vz-line border-node-vz-outline text-node-text"
                  >
                    {label}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-node-text">
                  No labels selected
                </span>
              )}
            </div>
          </div>
        )}

        <div className="px-[10px] pb-[20px] undraggable">
          <div className="mt-2 overflow-hidden border border-node-vz-outline shadow-sm rounded-[4px] undraggable">
            <ScrollArea className="flex min-w-52 undraggable">
              <Table className="min-w-full bg-node-vz">
                <TableCaption className="p-4 text-sm text-node-text">
                  Excel Data - Select columns for features and labels
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    {getTableHeaders().map((header) => (
                      <TableHead
                        key={header}
                        className="text-node-text text-left text-sm sticky top-0 bg-node-vz-line z-10 px-4 min-w-[120px] align-top"
                      >
                        <div className="flex flex-col gap-2 py-2">
                          <span className="font-medium">{header}</span>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`feature-${header}`}
                                checked={selectedFeatures.includes(header)}
                                onCheckedChange={() => toggleFeature(header)}
                                className="border-node-vz-outline data-[state=checked]:bg-node-vz data-[state=checked]:border-node-vz-activ h-4 w-4"
                              />
                              <label
                                htmlFor={`feature-${header}`}
                                className="text-xs font-medium text-node-text"
                              >
                                Feature
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`label-${header}`}
                                checked={selectedLabels.includes(header)}
                                onCheckedChange={() => toggleLabel(header)}
                                className="border-node-vz-outline data-[state=checked]:bg-node-vz data-[state=checked]:border-node-vz-activ h-4 w-4"
                              />
                              <label
                                htmlFor={`label-${header}`}
                                className="text-xs font-medium text-node-text"
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
                      className="transition-colors hover:bg-node-vz-line border-node-vz-line"
                    >
                      {getTableHeaders().map((header) => (
                        <TableCell
                          key={header}
                          className={`text-sm text-node-text ${
                            selectedFeatures.includes(header)
                              ? "bg-node-input-focus"
                              : selectedLabels.includes(header)
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
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
}

export default DataNodeComponent;
