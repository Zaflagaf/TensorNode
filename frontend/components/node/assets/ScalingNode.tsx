import useLayout from "@/frontend/hooks/useLayout";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { Node } from "@/frontend/types";
import { useEffect, useState } from "react";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";
import WorkflowDataShower from "../layouts/Shower";
import useSyncNodePorts from "@/frontend/hooks/useSyncNodePorts";

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
  if (!Array.isArray(input) || !Array.isArray(schema) || schema.length === 0) return input;


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
  const { inputs, outputs } = node.content.ports
  
  const [method, setMethod] = useState(inputs["in-method"].value);

  useEffect(() => {
    const inputData = inputs["in-data"].value;
    const inputReference = inputs["in-reference"].value;

    const newOutputData = scaleData(inputData, inputReference, method);
    if (!newOutputData || newOutputData.length === 0) return;

    setNodeOutput(node.id, "out-data", newOutputData);

  }, [inputs, method]);

  useLayout(node, {
    "in-method": method,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHead label={"Scaling"} className={"bg-hue-120"} />
      <WorkflowBody>
        <WorkflowSelection
          label={"Method"}
          selection={method}
          setSelection={setMethod}
          choices={["none", "normalization", "standardization"]}
        />
        <WorkflowHandle type="source" handleId="out-data" node={node}>
          <WorkflowDefault>
            Data
          </WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-data" node={node}>
          <WorkflowDefault>
            Data
          </WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-reference" node={node}>
          <WorkflowDefault>
            Reference
          </WorkflowDefault>
        </WorkflowHandle>

        {/* <WorkflowDataShower
          data={outputs["out-data"].value}
        /> */}
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}

export default ScalingNodeComponent;
