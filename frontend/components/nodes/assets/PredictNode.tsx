"use client";
import { Button } from "@/frontend/components/ui/button";
import layers from "@/public/svg/layers.svg";
import { useState } from "react";

import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";
import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";
import NodeHeader from "../../layout/Header/NodeHeader";

import { predict } from "@/frontend/services/api";

export function PredictNodeComponent({ node }: { node: NodeType }) {
  const [prediction, setPrediction] = useState<any>(null);
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);

  return (
    <WorkflowNode node={node}>
      <div className="predict w-52">
        <NodeHeader label={node.content.name} logo={layers} />
        <WorkflowHandle type="source" id="h1" port="labels" node={node}>
          <div>Prediction</div>
        </WorkflowHandle>
        <WorkflowHandle type="target" id="h2" port="model" node={node}>
          <div>Model</div>
        </WorkflowHandle>
        <WorkflowHandle type="target" id="h3" port="data" node={node}>
          <div>Data</div>
        </WorkflowHandle>
        <div className="flex w-full px-2 py-2">
          <Button
            onClick={async () => {

              const result = await predict(
                node.content.ports.inputs.model,
                node.content.ports.inputs.data
              );
              setPrediction(result);
                            console.log(result)
              setNodeOutput(node.id, "labels", result);
            }}
            className="flex w-full"
          >
            Predict
          </Button>
        </div>
      </div>
    </WorkflowNode>
  );
}

export default PredictNodeComponent;
