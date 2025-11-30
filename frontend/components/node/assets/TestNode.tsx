import { Node } from "@/frontend/types";
import { useEffect } from "react";
import WorkflowHandle from "../../handle/Handle";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowNode from "../Node";

export default function TestNodeComponent({ node }: { node: Node }) {


  return (
    <WorkflowNode node={node} className="min-w-auto">
      <WorkflowBody>
        <WorkflowHandle node={node} handleId="in-test" type="target">
          <WorkflowDefault>Input</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle node={node} handleId="out-test" type="source">
          <WorkflowDefault>Output</WorkflowDefault>
        </WorkflowHandle>
      </WorkflowBody>
    </WorkflowNode>
  );
}
