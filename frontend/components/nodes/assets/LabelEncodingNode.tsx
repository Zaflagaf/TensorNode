"use client";

import { Label } from "@/frontend/components/ui/label";

// (import) icons
import layers from "@/public/svg/layers.svg";

// (import) hooks
import { useEffect, useState } from "react";

// (import) parts
import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";

// (import) ui
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import NodeHeader from "../../layout/Header/NodeHeader";

import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { ArrayShower } from "../../layout/Shower";

function oneHot(labels: number[]): number[][] {
  const uniqueLabels = Array.from(new Set(labels)).sort((a, b) => a - b);
  const labelToIndex = new Map(uniqueLabels.map((v, i) => [v, i]));

  return labels.map((label) => {
    const oneHotVector = new Array(uniqueLabels.length).fill(0);
    const idx = labelToIndex.get(label);
    if (idx !== undefined) oneHotVector[idx] = 1;
    return oneHotVector;
  });
}

function labelEncode<T>(labels: T[]): number[] {
  const uniqueLabels = Array.from(new Set(labels));
  const labelToIndex = new Map(uniqueLabels.map((v, i) => [v, i]));

  return labels.map((label) => {
    const idx = labelToIndex.get(label);
    if (idx === undefined) throw new Error(`Label inconnu: ${label}`);
    return idx;
  });
}

function labelDecode<T>(encodedLabels: number[], labels: T[]): T[] {
  const uniqueLabels = Array.from(new Set(labels));
  return encodedLabels.map((i) => {
    if (i < 0 || i >= uniqueLabels.length)
      throw new Error(`Index invalide: ${i}`);
    return uniqueLabels[i];
  });
}

export function LabelEncodingNodeComponent({ node }: { node: NodeType }) {
  const [method, setMethod] = useState<string | null>(null);
  const [outputState, setOutputState] = useState([0]);

  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);

  const process = (inputData: any, schema: any) => {
    let z = inputData.flat();

    if (method === "labelEncode") {
      z = labelEncode(z);
    } else if (method === "oneHot") {
      const encoded = labelEncode(z);
      z = oneHot(encoded);
    } else if (method === "labelDecode") {
      if (!schema) return [];
      const labels = schema.flat();

      const flatLabels = inputData.flat().map((v: number) => Math.round(v));
      z = labelDecode(flatLabels, labels);
    }

    return z;
  };

  useEffect(() => {
    const inputData = node.content.ports.inputs.labels;
    const inputSchema = node.content.ports.inputs.schema;
    const outputData = node.content.ports.inputs.data;

    if (!Array.isArray(inputData)) return;

    const z = process(inputData, inputSchema);

    if (z === outputData) return;

    setOutputState([z]);
    setNodeOutput(node.id, "data", [z]);
  }, [
    node.content.ports.inputs.labels,
    node.content.ports.inputs.schema,
    node.content.ports.inputs.data,
    method,
  ]);

  return (
    <WorkflowNode node={node}>
      <div>
        <NodeHeader label={node.content.name} logo={layers} />
        <div className="px-5 py-2 space-y-1">
          <Label htmlFor="encoding-method" className="text-muted-foreground">
            Method
          </Label>
          <Select
            onValueChange={(value) => setMethod(value)}
            defaultValue="none"
          >
            <SelectTrigger id="encoding-method" className="w-[180px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="oneHot">One Hot</SelectItem>
              <SelectItem value="labelEncode">Label Encode</SelectItem>
              <SelectItem value="labelDecode">Label Decode</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <WorkflowHandle type="source" id="h1" port="data" node={node}>
          <div>Data</div>
        </WorkflowHandle>
        <WorkflowHandle type="target" id="h2" port="labels" node={node}>
          <div>Labels</div>
        </WorkflowHandle>
        {method === "labelDecode" && (
          <WorkflowHandle type="target" id="h3" port="schema" node={node}>
            <div>Schema</div>
          </WorkflowHandle>
        )}
        <ArrayShower data={outputState} />
      </div>
    </WorkflowNode>
  );
}

export default LabelEncodingNodeComponent;
