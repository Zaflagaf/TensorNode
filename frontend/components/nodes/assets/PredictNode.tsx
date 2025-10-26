"use client";
import { useState } from "react";

import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";

import { Node, ButtonStatus } from "@/frontend/types";
import { predict } from "@/frontend/services/api";
import WorkflowBody from "../layouts/Body";
import WorkflowButton from "../layouts/Button";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";

export function PredictNodeComponent({ node }: { node: Node }) {
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  return (
    <WorkflowNode node={node}>
      <div className="predict w-52">
        <WorkflowHead label={"Predict"} className={"bg-20"} />
        <WorkflowBody>
          <WorkflowHandle type="source" handleId="h1" port="labels" node={node}>
            <WorkflowDefault label="Prediction" />
          </WorkflowHandle>
          <WorkflowHandle type="target" handleId="h2" port="model" node={node}>
            <WorkflowDefault label="Model" />
          </WorkflowHandle>
          <WorkflowHandle type="target" handleId="h3" port="data" node={node}>
            <WorkflowDefault label="Data" />
          </WorkflowHandle>
          <WorkflowButton
            label="Predict"
            status={buttonStatus}
            onClick={async () => {
              const result = await predict(
                node.content.ports.inputs["in-model"].value,
                node.content.ports.inputs["in-data"].value,
                setButtonStatus
              );

              setNodeOutput(node.id, "labels", result);
            }}
          />
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
}

export default PredictNodeComponent;
