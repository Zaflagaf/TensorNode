import useLayout from "@/frontend/hooks/useLayout";
import { Node } from "@/frontend/types";
import { useState } from "react";
import WorkflowHandle from "../../handle/Handle";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowHeader from "../layouts/Header";
import WorkflowNumber from "../layouts/Number";
import WorkflowNode from "../Node";

export default function ValueNodeComponent({ node }: { node: Node }) {
  const [number, setNumber] = useState<number>(
    node.content.ports.inputs["in-data"].value
  );

  useLayout(node, {
    "in-data": number,
    "out-data": number,
  });

  return (
    <WorkflowNode node={node} className="">
      <WorkflowHeader
        label={node.content.name}
        icon={node.content.icon}
        className={node.content.color as string}
      />
      <WorkflowBody>
        {" "}
        <WorkflowHandle node={node} handleId="out-data" type="source">
          <WorkflowDefault>Output</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowNumber label="value" number={number} setNumber={setNumber} />
        {/* <WorkflowHandle node={node} handleId="in-test" type="target">
          <WorkflowDefault>Input</WorkflowDefault>
        </WorkflowHandle> */}
      </WorkflowBody>
    </WorkflowNode>
  );
}
