import useLayout from "@/frontend/hooks/useLayout";
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";
import { Node } from "@/frontend/types";
import { useState } from "react";
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
      <WorkflowHeader label={node.content.name} className="bg-hue-120" />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-layer" node={node}>
          <WorkflowDefault label="Layer" />
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-layer" node={node}>
          <WorkflowDefault label="Layer" />
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
