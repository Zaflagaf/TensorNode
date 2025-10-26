import WorkflowHandle from "@/frontend/organism/handle/Handle";

import WorkflowNode from "@/frontend/organism/node/Node";
import { Node } from "@/frontend/types"; 
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";

export default function ConcatenateNodeComponent({ node }: { node: Node }) {
  return (
    <WorkflowNode node={node}>
      <WorkflowHeader label={node.content.name} className="bg-hue-250" />
      <WorkflowBody>
        <WorkflowHandle node={node} handleId="out-data" type="source">
          <WorkflowDefault label="[A B]" />
        </WorkflowHandle>
        <WorkflowHandle node={node} handleId="in-a" type="target">
          <WorkflowDefault label="A" />
        </WorkflowHandle>
        <WorkflowHandle node={node} handleId="in-b" type="target">
          <WorkflowDefault label="B" />
        </WorkflowHandle>
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
