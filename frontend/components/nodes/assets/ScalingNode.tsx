import { Label } from "@/frontend/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";

import layers from "@/public/svg/layers.svg";
import { useEffect, useState } from "react";

import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";
import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";
import NodeHeader from "../../layout/Header/NodeHeader";

// Fonction de stats par colonne
function getStats(array: number[]) {
  const n = array.length;
  const mean = array.reduce((acc, val) => acc + val, 0) / n;
  const std = Math.sqrt(
    array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n
  );
  const min = Math.min(...array);
  const max = Math.max(...array);
  return { mean, std, min, max };
}

// Transposition lignes <-> colonnes
function transpose(matrix: number[][]): number[][] {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}

// Application de la méthode à chaque colonne
function scaleData(
  input: number[][],
  schema: number[][],
  method: string
): number[][] {
  if (!Array.isArray(input) || !Array.isArray(schema)) return input;

  const schemaT = transpose(schema);
  const inputT = transpose(input);

  const stats = schemaT.map(getStats);

  const scaledT = inputT.map((col, i) => {
    const { mean, std, min, max } = stats[i];
    if (method === "standardization") {
      return col.map((v) => (std === 0 ? 0 : (v - mean) / std));
    } else if (method === "normalization") {
      return col.map((v) => (max === min ? 0 : (v - min) / (max - min)));
    } else {
      return col;
    }
  });

  return transpose(scaledT);
}

export function ScalingNodeComponent({ node }: { node: NodeType }) {
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  const [method, setMethod] = useState<string>("none");

  useEffect(() => {
    const inputData: number[][] = node.content.ports.inputs.data;
    const schemaData: number[][] = node.content.ports.inputs.schema;
    const outputData: number[][] = node.content.ports.outputs.data;

    if (!Array.isArray(inputData) || !Array.isArray(schemaData)) return;

    const transformed = scaleData(inputData, schemaData, method);

    if (JSON.stringify(transformed) !== JSON.stringify(outputData)) {
      setNodeOutput(node.id, "data", transformed);
    }
  }, [JSON.stringify(node.content.ports.inputs), method]);

  return (
    <WorkflowNode node={node}>
      <div>
        <NodeHeader label={node.content.name} logo={layers} />
        <div className="px-5 py-2 space-y-1">
          <Label htmlFor="scaling-method" className="text-muted-foreground">
            Method
          </Label>
          <Select
            onValueChange={(value) => setMethod(value)}
            defaultValue="none"
          >
            <SelectTrigger className="w-[180px]" id="scaling-method">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="normalization">Normalization</SelectItem>
              <SelectItem value="standardization">Standardization</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <WorkflowHandle type="source" id="h1" port="data" node={node}>
          <div>Scaled Data</div>
        </WorkflowHandle>

        <WorkflowHandle type="target" id="h2" port="data" node={node}>
          <div>Data</div>
        </WorkflowHandle>

        <WorkflowHandle type="target" id="h3" port="schema" node={node}>
          <div>Schema</div>
        </WorkflowHandle>
      </div>
    </WorkflowNode>
  );
}

export default ScalingNodeComponent;
