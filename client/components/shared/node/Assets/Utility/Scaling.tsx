import Handle from "@/components/shared/handle/Handle";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlowContext } from "@/context/FlowContext";
import layers from "@/public/layers.svg";
import { useEffect, useState } from "react";
import NodeHeader from "../../Layout/Header/NodeHeader";
import Node from "../../Node";

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

export function ScalingNodeComponent({
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
  const [method, setMethod] = useState<string>("none");

  useEffect(() => {
    const inputData: number[][] = values.input?.data;
    const schemaData: number[][] = values.input?.schema;
    const outputData: number[][] = values.output?.data;

    if (!Array.isArray(inputData) || !Array.isArray(schemaData)) return;

    const transformed = scaleData(inputData, schemaData, method);

    if (JSON.stringify(transformed) !== JSON.stringify(outputData)) {
      updateNode(id, "values.output.data", transformed);
    }
  }, [JSON.stringify(values.input), method, id]);

  return (
    <Node id={id} defaultPosition={position}>
      <div className="scaling" id={id}>
        <NodeHeader label={label} id={id} logo={layers} />
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

        <Handle type="source" id="scaling-h1" dataId="data">
          <div>Scaled Data</div>
        </Handle>

        <Handle type="target" id="scaling-h2" dataId="data">
          <div>Data</div>
        </Handle>

        <Handle type="target" id="scaling-h3" dataId="schema">
          <div>Schema</div>
        </Handle>
      </div>
    </Node>
  );
}

export default ScalingNodeComponent;
