import { Node } from "@/frontend/types";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";

export default function ConcatenateNodeComponent({ node }: { node: Node }) {
  return (
    <WorkflowNode node={node}>
      <WorkflowHeader
        label={node.content.name}
        icon={node.content.icon}
        className="bg-hue-250"
      />
      <WorkflowBody>
        <WorkflowHandle node={node} handleId="out-data" type="source">
          <WorkflowDefault>
            [A B]
          </WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle node={node} handleId="in-a" type="target">
          <WorkflowDefault>
            A
          </WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle node={node} handleId="in-b" type="target">
          <WorkflowDefault>
            B
          </WorkflowDefault>
        </WorkflowHandle>
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
