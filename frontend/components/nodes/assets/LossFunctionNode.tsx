"use client";

// (import) bilbiotheques externes

// (import) ui

// (import) icons

// (import) hooks

// (import) parts
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";

import { Node } from "@/frontend/types";
import useLayout from "@/frontend/hooks/useLayout";
import { useState } from "react";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";

import { LOSSES } from "@/frontend/config/data/constants";

const LossFunctionNodeComponent = ({ node }: { node: Node }) => {
  const [loss, setLoss] = useState<string>(
    node.content.ports.inputs["in-loss"].value
  );

  useLayout(node, {
    "in-loss": loss,
  });

  return (
    <WorkflowNode node={node}>
      <div className="w-[250px]">
        <WorkflowHead label={node.content.name} className={"bg-hue-20"} />
        <WorkflowBody>
          <WorkflowHandle type="source" handleId="out-loss" node={node}>
            <WorkflowDefault label="Loss" />
          </WorkflowHandle>
          <WorkflowHandle type="target" handleId="in-prediction" node={node}>
            <WorkflowDefault label="Prediction" />
          </WorkflowHandle>

          <WorkflowHandle type="target" handleId="in-labels" node={node}>
            <WorkflowDefault label="Expected" />
          </WorkflowHandle>
          <WorkflowSelection
            label="loss function"
            selection={loss}
            setSelection={setLoss}
            choices={LOSSES}
          />
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
};

export default LossFunctionNodeComponent;
