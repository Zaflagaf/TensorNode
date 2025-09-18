import { Label } from "@/frontend/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import { useFlowContext } from "@/frontend/context/FlowContext";
import Handle from "@/frontend/organism/Handle";
import layers from "@/public/svg/layers.svg";
import { useEffect, useState } from "react";
import Node from "../../../../../organism/Node";
import NodeHeader from "../../Layout/Header/NodeHeader";
import { ArrayShower } from "./Shower";

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

export function LabelEncodingNodeComponents({
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
  const { updateNode } = useFlowContext();
  const [method, setMethod] = useState<string | null>(null);
  const [outputState, setOutputState] = useState([0]);

  const process = (inputData: any, schema: any) => {
    let z = inputData.flat();

    if (method === "labelEncode") {
      z = labelEncode(z);
    } else if (method === "oneHot") {
      const encoded = labelEncode(z); // encode string labels to integers
      z = oneHot(encoded); // then apply one-hot
    } else if (method === "labelDecode") {
      if (!schema) return [];
      const labels = schema.flat(); // aplati [["setosa"], ["virginica"]] → ["setosa", "virginica"]

      const flatLabels = inputData.flat().map((v: number) => Math.round(v));
      z = labelDecode(flatLabels, labels);
    }

    return z;
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const inputData = values.input.labels;
      const inputSchema = values.input.schema;
      const outputData = values.output.data;

      if (!Array.isArray(inputData)) return;

      const z = process(inputData, inputSchema);

      if (z === outputData) return;

      setOutputState([z]);
      updateNode(id, "values.output.data", [z]);
    }, 0);

    return () => clearTimeout(timeout);
  }, [
    JSON.stringify(values.input.labels),
    JSON.stringify(values.input.data),
    method,
    id,
  ]);

  return (
    <Node id={id} defaultPosition={position}>
      <div className="labelEncoding" id={id}>
        <NodeHeader label={label} id={id} logo={layers} />
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
        <Handle type="source" id="labelEncoding-h1" dataId="data">
          <div>Data</div>
        </Handle>
        <Handle type="target" id="labelEncoding-h2" dataId="labels">
          <div>Labels</div>
        </Handle>
        {method === "labelDecode" && (
          <Handle type="target" id="labelEncoding-h3" dataId="schema">
            <div>Schema</div>
          </Handle>
        )}
        <ArrayShower data={outputState} />
      </div>
    </Node>
  );
}

export default LabelEncodingNodeComponents;
