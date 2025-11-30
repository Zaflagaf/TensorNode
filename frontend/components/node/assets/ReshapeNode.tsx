import { Node } from "@/frontend/types";
import { useState } from "react";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";
import ShapeVisualizer from "../layouts/ShapeVZ";
import WorkflowSubGrid from "../layouts/sublayouts/Grid";
import WorkflowTensor from "../layouts/Tensor";

export default function DropoutNodeComponent({ node }: { node: Node }) {
  const [shape, setShape] = useState<number[]>(
    node.content.ports.inputs["in-shape"].value
  );

  useLayout(node, {
    "in-shape": shape,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader
        label={node.content.name}
        icon={node.content.icon}
        className="bg-hue-120"
      />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-layer" node={node}>
          <WorkflowDefault>
            Layer
          </WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-layer" node={node}>
          <WorkflowDefault>
            Layer
          </WorkflowDefault>
        </WorkflowHandle>
        <div className="flex flex-col gap-3">
          <div className="flex w-[300px] items-center justify-center">
            <WorkflowSubGrid>
              <ShapeVisualizer dimensions={shape} />
            </WorkflowSubGrid>
          </div>
        </div>
        <WorkflowTensor tensor={shape} setTensor={setShape} label="Shape" />
      </WorkflowBody>
      <WorkflowFooter></WorkflowFooter>
    </WorkflowNode>
  );
}
