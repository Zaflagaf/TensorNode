"use client";

// (import) bibliotheques externes

// (import) types
import { Node } from "@/frontend/types";

// (import) useStores

// (import) parts
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";

// (import) layouts
import useLayout from "@/frontend/hooks/useLayout";
import { useState } from "react";
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
      <WorkflowHead label={node.content.name} className={"bg-hue-70"} />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-layer" node={node}>
          <WorkflowDefault label="Layer" />
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-layer" node={node}>
          <WorkflowDefault label="Layer" />
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
