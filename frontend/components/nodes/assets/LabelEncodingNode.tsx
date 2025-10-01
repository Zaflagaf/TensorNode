"use client";

// (import) icons

// (import) hooks
import { useEffect, useState } from "react";

// (import) parts
import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";

// (import) ui

import { NodeType } from "@/frontend/schemas/node";
import { ButtonStatus } from "@/frontend/schemas/types/general";
import { useNodesStore } from "@/frontend/store/nodesStore";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";
import WorkflowDataShower from "../layouts/Shower";

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

export function LabelEncodingNodeComponent({ node }: { node: NodeType }) {
  const [method, setMethod] = useState<string>("none");
  const [outputState, setOutputState] = useState<any[]>([0]);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);

  const process = () => {
    const data = node.content.ports.inputs.labels;

    if (!data) return;

    const schema = node.content.ports.inputs.schema;

    if (!Array.isArray(data)) return;

    let z = data.flat();

    if (method === "label encoding") {
      z = labelEncode(z);
    } else if (method === "one hot") {
      const encoded = labelEncode(z);
      z = oneHot(encoded);
    } else if (method === "label decoding") {
      if (!schema) return [];

      const labels = schema.flat();

      const flatLabels = data.flat().map((v: number) => Math.round(v));

      z = labelDecode(flatLabels, labels);
    }

    return z;
  };

  useEffect(() => {
    setTimeout(() => {
      const outputData = node.content.ports.outputs.data;

      const transformed = process();
      console.log("processed label: ", transformed);
      if (transformed == undefined) {
        return;
      }
      if (transformed === outputData) return;

      setOutputState(transformed);
      setNodeOutput(node.id, "data", transformed);
      /*       setButtonStatus("success"); */
    }, 0);
  }, [node.content.ports.inputs, method]);

  return (
    <WorkflowNode node={node}>
      <div className="w-[250px]">
        <WorkflowHead
          label={"Label Encoding"}
          className={"from-node-head-transform-from-gradient to-node-head-transform-to-gradient"}
        />
        <WorkflowBody>
          <WorkflowHandle type="source" id="h1" port="data" node={node}>
            <WorkflowDefault label="Data" />
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h2" port="labels" node={node}>
            <WorkflowDefault label="Labels" />
          </WorkflowHandle>
          <WorkflowSelection
            label="Method"
            selection={method}
            setSelection={(value) => setMethod(value)}
            choices={["none", "one hot", "label encoding", "label decoding"]}
          />
          {method === "label decoding" && (
            <WorkflowHandle type="target" id="h3" port="schema" node={node}>
              <WorkflowDefault label="Schema" />
            </WorkflowHandle>
          )}
          <WorkflowDataShower data={outputState} />
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
}

export default LabelEncodingNodeComponent;
