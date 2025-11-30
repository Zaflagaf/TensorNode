import { Node } from "@/frontend/types";
import { useState } from "react";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowCollapsible from "../layouts/Collapsible";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import ShapeVisualizer from "../layouts/ShapeVZ";
import SubGrid from "../layouts/sublayouts/Grid";
import WorkflowTensor from "../layouts/Tensor";

const InputNodeComponent = ({ node }: { node: Node }) => {
  const [shape, setShape] = useState<number[]>(
    node.content.ports.inputs["in-shape"].value
  );

  useLayout(node, { "in-shape": shape });

  return (
    <WorkflowNode node={node}>
      <WorkflowHead
        label={node.content.name}
        icon={node.content.icon}
        className={"bg-hue-0"}
      />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-layer" node={node}>
          <WorkflowDefault>Layer</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowTensor
          tensor={shape}
          setTensor={setShape}
          label="Input Shape"
        />{" "}
        <WorkflowCollapsible label="Preview">
          <div className="flex flex-col gap-3">
            <div className="flex w-[300px] items-center justify-center">
              <SubGrid>
                <ShapeVisualizer dimensions={shape} />
              </SubGrid>
            </div>
          </div>
        </WorkflowCollapsible>
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
};

export default InputNodeComponent;
