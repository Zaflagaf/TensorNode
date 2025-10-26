import useLayout from "@/frontend/hooks/useLayout";
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";
import { Node } from "@/frontend/types";
import { useState } from "react";
import WorkflowBody from "../layouts/Body";
import WorkflowChart from "../layouts/Chart";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";

import { ACTIVATIONS } from "@/frontend/config/data/constants";

export default function ActivationNodeComponent({ node }: { node: Node }) {
  const [activation, setActivation] = useState<string>(
    node.content.ports.inputs["in-activation"].value
  );
  const [alpha, setAlpha] = useState<number | number[]>(
    node.content.ports.inputs["in-alpha"].value
  );

  useLayout(node, {
    "in-activation": activation,
    "in-alpha": alpha,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader label={node.content.name} className="bg-hue-180" />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-layer" node={node}>
          <WorkflowDefault label="Layer" />
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-layer" node={node}>
          <WorkflowDefault label="Layer" />
        </WorkflowHandle>
        <WorkflowSelection
          selection={activation}
          setSelection={setActivation}
          label="Activation"
          choices={ACTIVATIONS}
        />
        <WorkflowChart functionType={activation} />
      </WorkflowBody>
      <WorkflowFooter></WorkflowFooter>
    </WorkflowNode>
  );
}
