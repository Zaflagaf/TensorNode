import { Node } from "@/frontend/types";
import { useEffect, useState } from "react";

import { useNodesStore } from "@/frontend/store/nodesStore";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";

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

function labelDecode<T>(encodedLabels: number[], labels: T[]): (T | string)[] {
  const uniqueLabels = Array.from(new Set(labels));

  return encodedLabels.map((i) => {
    if (i < 0 || i >= uniqueLabels.length) {
      return "label out of bounds"; // ⬅️ ici au lieu de throw
    }
    return uniqueLabels[i];
  });
}

export function LabelEncodingNodeComponent({ node }: { node: Node }) {
  const { inputs, outputs } = node.content.ports;
  const [method, setMethod] = useState<string>(inputs["in-method"].value);
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);

  useLayout(node, { "in-method": method });

  const process = (labels: any, reference: any) => {
    if (!labels) return;

    let z = labels.flat();

    switch (method) {
      case "label encoding":
        z = labelEncode(z);
        break;
      case "one hot":
        z = oneHot(labelEncode(z));
        break;
      case "label decoding":
        if (!reference) return;

        const labels = reference.flat();
        const flatLabels = reference.flat().map((v: number) => Math.round(v));

        z = labelDecode(flatLabels, labels);
        break;
    }

    return z;
  };

  useEffect(() => {
    const outputData = outputs["out-data"].value;
    const inputLabels = inputs["in-labels"].value;
    const inputReference = inputs["in-reference"].value;

    const newOutputData = process(inputLabels, inputReference);
    if (newOutputData == undefined || newOutputData === outputData) return;

    setNodeOutput(node.id, "out-data", newOutputData);
  }, [inputs, method]);

  return (
    <WorkflowNode node={node}>
      <WorkflowHead label={"Label Encoding"} className={"bg-hue-120"} />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-data" node={node}>
          <WorkflowDefault>Data</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-labels" node={node}>
          <WorkflowDefault>Labels</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowSelection
          label="Method"
          selection={method}
          setSelection={(value) => setMethod(value)}
          choices={["none", "one hot", "label encoding", "label decoding"]}
        />
        {method === "label decoding" && (
          <WorkflowHandle type="target" handleId="in-reference" node={node}>
            <WorkflowDefault>Reference</WorkflowDefault>
          </WorkflowHandle>
        )}
        {/* <WorkflowDataShower
          data={node.content.ports.outputs["out-data"].value}
        /> */}
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}

export default LabelEncodingNodeComponent;
