"use client";
import { useEffect, useState } from "react";

import useLayout from "@/frontend/hooks/useLayout";
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";
import { Node } from "@/frontend/types";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";
import WorkflowDataShower from "../layouts/Shower";

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

export function ScalingNodeComponent({ node }: { node: Node }) {
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  const [method, setMethod] = useState<string>(
    node.content.ports.inputs["in-method"].value
  );
  const [transformed, setTransformed] = useState<any[]>(
    node.content.ports.outputs["out-data"].value ?? []
  );

  useEffect(() => {
    setTimeout(() => {
      const inputData: number[][] = node.content.ports.inputs["in-data"].value;
      const schemaData: number[][] =
        node.content.ports.inputs["in-reference"].value;
      const outputData: number[][] =
        node.content.ports.outputs["out-data"].value;

      if (!Array.isArray(inputData) || !Array.isArray(schemaData)) return;

      const transformed = scaleData(inputData, schemaData, method);
      if (JSON.stringify(transformed) !== JSON.stringify(outputData)) {
        setNodeOutput(node.id, "out-data", transformed);
        setTransformed(transformed);
      }
    }, 0);
  }, [node.content.ports.inputs, method]);

  useLayout(node, {
    "in-method": method,
  });

  return (
    <WorkflowNode node={node}>
      <div className="w-[250px]">
        <WorkflowHead label={"Scaling"} className={"bg-hue-120"} />
        <WorkflowBody>
          <WorkflowSelection
            label={"Method"}
            selection={method}
            setSelection={setMethod}
            choices={["none", "normalization", "standardization"]}
          />
          <WorkflowHandle type="source" handleId="out-data" node={node}>
            <WorkflowDefault label="Data" />
          </WorkflowHandle>
          <WorkflowHandle type="target" handleId="in-data" node={node}>
            <WorkflowDefault label="Data" />
          </WorkflowHandle>
          <WorkflowHandle type="target" handleId="in-reference" node={node}>
            <WorkflowDefault label="Reference" />
          </WorkflowHandle>
          <WorkflowDataShower data={transformed} />
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
}

export default ScalingNodeComponent;
