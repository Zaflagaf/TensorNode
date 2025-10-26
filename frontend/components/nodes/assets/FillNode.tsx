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

export default function FillNodeComponent({ node }: { node: Node }) {
  const [fillNumber, setFillNumber] = useState<number>(
    node.content.ports.inputs["in-fillNumber"].value
  );

  useLayout(node, {
    "in-fillNumber": fillNumber,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader label={node.content.name} className="bg-hue-250" />
      <WorkflowBody>
        <WorkflowHandle node={node} handleId="out-data" type="source">
          <WorkflowDefault label="Data" />
        </WorkflowHandle>
        <WorkflowHandle node={node} handleId="in-data" type="target">
          <WorkflowDefault label="Data" />
        </WorkflowHandle>
        <WorkflowNumber
          number={fillNumber}
          setNumber={setFillNumber}
          label="Fill number"
        />
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
