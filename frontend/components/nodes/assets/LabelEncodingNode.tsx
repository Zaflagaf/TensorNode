"use client";

// (import) icons

// (import) hooks
import { useEffect, useState } from "react";

// (import) parts
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";

// (import) ui

import useLayout from "@/frontend/hooks/useLayout";
import { Node, ButtonStatus } from "@/frontend/types";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";
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

export function LabelEncodingNodeComponent({ node }: { node: Node }) {
  const [method, setMethod] = useState<string>(
    node.content.ports.inputs["in-method"].value
  );
  const [outputState, setOutputState] = useState<any[]>(
    node.content.ports.outputs["out-data"].value
  );
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);

  useLayout(node, {
    "in-method": method,
  });

  const process = () => {
    const labels = node.content.ports.inputs["in-labels"].value;

    if (!labels) return;

    const reference = node.content.ports.inputs["in-reference"].value;

    if (!Array.isArray(labels)) return;

    let z = labels.flat();

    if (method === "label encoding") {
      z = labelEncode(z);
    } else if (method === "one hot") {
      const encoded = labelEncode(z);
      z = oneHot(encoded);
    } else if (method === "label decoding") {
      if (!reference) return [];

      const labels = reference.flat();

      const flatLabels = reference.flat().map((v: number) => Math.round(v));

      z = labelDecode(flatLabels, labels);
    }

    return z;
  };

  useEffect(() => {
    setTimeout(() => {
      const outputData = node.content.ports.outputs["out-data"].value;

      const transformed = process();

      if (transformed == undefined) {
        return;
      }
      if (transformed === outputData) return;

      setOutputState(transformed);
      setNodeOutput(node.id, "out-data", transformed);
      /*       setButtonStatus("success"); */
    }, 0);
  }, [node.content.ports.inputs, method]);

  return (
    <WorkflowNode node={node}>
      <div className="w-[250px]">
        <WorkflowHead label={"Label Encoding"} className={"bg-hue-120"} />
        <WorkflowBody>
          <WorkflowHandle type="source" handleId="out-data" node={node}>
            <WorkflowDefault label="Data" />
          </WorkflowHandle>
          <WorkflowHandle type="target" handleId="in-labels" node={node}>
            <WorkflowDefault label="Labels" />
          </WorkflowHandle>
          <WorkflowSelection
            label="Method"
            selection={method}
            setSelection={(value) => setMethod(value)}
            choices={["none", "one hot", "label encoding", "label decoding"]}
          />
          {method === "label decoding" && (
            <WorkflowHandle
              type="target"
              handleId="in-reference"
              port="reference"
              node={node}
            >
              <WorkflowDefault label="Reference" />
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
