"use client";

import { useState } from "react";

// (import) parts
import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";

import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";

import { compileModel } from "@/frontend/services/api";

// Status types for button state
import { ButtonStatus } from "@/frontend/schemas/types/general";
import WorkflowBody from "../layouts/Body";
import WorkflowButton from "../layouts/Button";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";

const CompileNodeComponent = ({ node }: { node: NodeType }) => {
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  return (
    <WorkflowNode node={node}>
      <div className="w-[250px]">
        <WorkflowHead label={"Compile"} className={"from-node-head-model-from-gradient to-node-head-model-to-gradient"} />
        <WorkflowBody>
          <WorkflowHandle type="source" id="h1" port="model" node={node}>
            <WorkflowDefault label="Compiled Model" />
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h2" port="model" node={node}>
            <WorkflowDefault label="Model" />
          </WorkflowHandle>
          <WorkflowButton
            label="compile"
            onClick={() => {
              const modelId = node.content.ports.inputs.model;
              setNodeOutput(node.id, "model", modelId);

              if (!modelId) return;
              compileModel(
                modelId,
                node.content.ports.inputs.optimizer ?? "adam",
                node.content.ports.inputs.loss ??
                  "sparse_categorical_crossentropy",
                [node.content.ports.inputs.metrics ?? "accuracy"],
                setButtonStatus
              );
            }}
            status={buttonStatus}
          />
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
};

export default CompileNodeComponent;
