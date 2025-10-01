"use client";
import { useState } from "react";

import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";
import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";

import { ButtonStatus } from "@/frontend/schemas/types/general";
import { predict } from "@/frontend/services/api";
import WorkflowBody from "../layouts/Body";
import WorkflowButton from "../layouts/Button";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";

export function PredictNodeComponent({ node }: { node: NodeType }) {
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  return (
    <WorkflowNode node={node}>
      <div className="predict w-52">
        <WorkflowHead label={"Predict"} className={"from-red-700 to-red-950"} />
        <WorkflowBody>
          <WorkflowHandle type="source" id="h1" port="labels" node={node}>
            <WorkflowDefault label="Prediction" />
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h2" port="model" node={node}>
            <WorkflowDefault label="Model" />
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h3" port="data" node={node}>
            <WorkflowDefault label="Data" />
          </WorkflowHandle>
          <WorkflowButton
            label="Predict"
            status={buttonStatus}
            onClick={async () => {
              const result = await predict(
                node.content.ports.inputs.model,
                node.content.ports.inputs.data,
                setButtonStatus
              );

              console.log(result.prediction)

              setNodeOutput(node.id, "labels", result.prediction);
            }}
          />
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
}

export default PredictNodeComponent;
