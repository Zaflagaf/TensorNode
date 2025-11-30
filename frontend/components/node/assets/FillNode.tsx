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

export default function FillNodeComponent({ node }: { node: Node }) {
  const [fillNumber, setFillNumber] = useState<number>(
    node.content.ports.inputs["in-fillNumber"].value
  );

  useLayout(node, {
    "in-fillNumber": fillNumber,
  });

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
            Data
          </WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle node={node} handleId="in-data" type="target">
          <WorkflowDefault>
            Data
          </WorkflowDefault>
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
