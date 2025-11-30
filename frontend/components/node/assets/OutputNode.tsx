import { Node } from "@/frontend/types";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";

const OutputNodeComponent = ({ node }: { node: Node }) => {
  return (
    <WorkflowNode node={node}>
      <WorkflowHead
        label={node.content.name}
        icon={node.content.icon}
        className={"bg-hue-0"}
      />
      <WorkflowBody>
        <WorkflowHandle type="target" handleId="in-layer" node={node}>
          <WorkflowDefault>Layer</WorkflowDefault>
        </WorkflowHandle>
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
};

export default OutputNodeComponent;
