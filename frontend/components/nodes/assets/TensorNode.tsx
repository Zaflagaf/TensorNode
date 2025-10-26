"use client";
import { useEffect, useState } from "react";

import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";

import { Node } from "@/frontend/types";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowTensor from "../layouts/Tensor";

const TensorNodeComponent = ({ node }: { node: Node }) => {
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  const [tensor, setTensor] = useState<number[]>(
    node.content.ports.outputs["out-data"].value
  );

  useEffect(() => {
    setNodeOutput(node.id, "out-data", tensor);
  }, [tensor]);

  return (
    <WorkflowNode node={node}>
      <WorkflowHead label={node.content.name} className={"bg-hue-290"} />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-data" node={node}>
          <WorkflowDefault label="Tensor" />
        </WorkflowHandle>
        <WorkflowTensor tensor={tensor} setTensor={setTensor} type="float" />
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
};

export default TensorNodeComponent;
