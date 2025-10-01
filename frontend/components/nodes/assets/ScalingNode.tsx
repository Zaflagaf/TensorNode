import { useEffect, useState } from "react";

import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";
import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";
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

export function ScalingNodeComponent({ node }: { node: NodeType }) {
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  const [method, setMethod] = useState<string>("none");
  const [transformed, setTransformed] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      const inputData: number[][] = node.content.ports.inputs.data;
      const schemaData: number[][] = node.content.ports.inputs.schema;
      const outputData: number[][] = node.content.ports.outputs.data;
      console.log(inputData, schemaData);
      if (!Array.isArray(inputData) || !Array.isArray(schemaData)) return;

      const transformed = scaleData(inputData, schemaData, method);
      if (JSON.stringify(transformed) !== JSON.stringify(outputData)) {
        setNodeOutput(node.id, "data", transformed);
        setTransformed(transformed);
      }
    }, 0);
  }, [node.content.ports.inputs, method]);

  return (
    <WorkflowNode node={node}>
      <div className="w-[250px]">
        <WorkflowHead
          label={"Scaling"}
          className={"from-node-head-transform-from-gradient to-node-head-transform-to-gradient"}
        />
        <WorkflowBody>
          <WorkflowSelection
            label={"Method"}
            selection={method}
            setSelection={setMethod}
            choices={["none", "normalization", "standardization"]}
          />
          <WorkflowHandle type="source" id="h1" port="data" node={node}>
            <WorkflowDefault label="Scaled Data" />
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h2" port="data" node={node}>
            <WorkflowDefault label="Data" />
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h3" port="schema" node={node}>
            <WorkflowDefault label="Schema" />
          </WorkflowHandle>
          <WorkflowDataShower data={transformed} />
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
}

export default ScalingNodeComponent;
