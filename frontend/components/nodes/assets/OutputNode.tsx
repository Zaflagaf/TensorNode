"use client";

import useLayout from "@/frontend/hooks/useLayout";
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";
import { Node } from "@/frontend/types";
import { useState } from "react";
import ShapeVisualizer from "../../layout/ShapeVZ/ShapeVZ";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import SubGrid from "../layouts/sublayouts/Grid";
import WorkflowTensor from "../layouts/Tensor";

const OutputNodeComponent = ({ node }: { node: Node }) => {
  const [shape, setShape] = useState<number[]>(
    node.content.ports.inputs["in-shape"].value
  );

  useLayout(node, { "in-shape": shape });

  return (
    <WorkflowNode node={node}>
      <WorkflowHead label={node.content.name} className={"bg-hue-0"} />
      <WorkflowBody>
        <WorkflowHandle type="target" handleId="in-layer" node={node}>
          <WorkflowDefault label="Layer" />
        </WorkflowHandle>
        <div className="flex flex-col gap-3">
          <div className="flex w-[300px] items-center justify-center">
            <SubGrid>
              <ShapeVisualizer dimensions={shape} />
            </SubGrid>
          </div>
        </div>
        <WorkflowTensor tensor={shape} setTensor={setShape} />
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
};

export default OutputNodeComponent;
