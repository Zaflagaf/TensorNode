"use client";

import { useState } from "react";

// (import) parts

import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";
import { ButtonStatus, Node } from "@/frontend/types";

import { compileModel } from "@/frontend/services/api";

import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowButton from "../layouts/Button";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";

const CompileNodeComponent = ({ node }: { node: Node }) => {
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  return (
    <WorkflowNode node={node}>
      <div className="w-[250px]">
        <WorkflowHead label={"Compile"} className={"bg-20"} />
        <WorkflowBody>
          <WorkflowHandle type="source" handleId="h1" port="model" node={node}>
            <WorkflowDefault label="Compiled Model" />
          </WorkflowHandle>
          <WorkflowHandle type="target" handleId="h2" port="model" node={node}>
            <WorkflowDefault label="Model" />
          </WorkflowHandle>
          <WorkflowButton
            label="compile"
            onClick={() => {
              const modelId = node.content.ports.inputs["in-model"].value;
              setNodeOutput(node.id, "model", modelId);

              if (!modelId) return;
              compileModel(
                modelId,
                node.content.ports.inputs["in-optimizer"].value ?? "adam",
                node.content.ports.inputs["in-loss"].value ??
                  "sparse_categorical_crossentropy",
                [node.content.ports.inputs["in-metrics"].value ?? "accuracy"],
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
