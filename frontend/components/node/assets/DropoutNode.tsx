import { Node } from "@/frontend/types";
import { useState } from "react";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";
import WorkflowNumber from "../layouts/Number";

export default function ReshapeNodeComponent({ node }: { node: Node }) {
  const [rate, setRate] = useState(node.content.ports.inputs["in-rate"].value);

  useLayout(node, {
    "in-rate": rate,
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
        <WorkflowNumber
          number={rate}
          setNumber={setRate}
          label="Rate"
          type="float"
        />
      </WorkflowBody>
      <WorkflowFooter></WorkflowFooter>
    </WorkflowNode>
  );
}
