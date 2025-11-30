import { Node } from "@/frontend/types";
import { useState } from "react";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowNumber from "../layouts/Number";

const BatchNormalizationComponent = ({ node }: { node: Node }) => {
  const [momentum, setMomentum] = useState(
    node.content.ports.inputs["in-momentum"].value
  );

  useLayout(node, {
    "in-momentum": momentum,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHead
        label={node.content.name}
        icon={node.content.icon}
        className={"bg-hue-70"}
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
        <WorkflowNumber
          number={momentum}
          setNumber={setMomentum}
          label="momentum"
          type="float"
        />
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
};

export default BatchNormalizationComponent;
