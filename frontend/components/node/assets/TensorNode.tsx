"use client";
import { useEffect, useState } from "react";

import { useNodesStore } from "@/frontend/store/nodesStore";
import { Node } from "@/frontend/types";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowTensor from "../layouts/Tensor";
import useLayout from "@/frontend/hooks/useLayout";

export default function TensorNodeComponent({ node }: { node: Node }) {
  const [tensor, setTensor] = useState<number[]>(
    node.content.ports.inputs["in-data"].value[0]
  );

  useLayout(node, {
    "in-data": [tensor],
    "out-data": [tensor]
  })



  return (
    <WorkflowNode node={node}>
      <WorkflowHead
        label={node.content.name}
        icon={node.content.icon}
        className={"bg-hue-290"}
      />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-data" node={node}>
          <WorkflowDefault>
            Tensor
          </WorkflowDefault>
        </WorkflowHandle>
        <WorkflowTensor tensor={tensor} setTensor={setTensor} type="float" />
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
