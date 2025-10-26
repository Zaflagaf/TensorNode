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
import WorkflowSelection from "../layouts/Selection";

export default function LatentVectoreNodeComponent({ node }: { node: Node }) {
  const [vectorSize, setVectorSize] = useState<number>(
    node.content.ports.inputs["in-vectorSize"].value
  );
  const [distribution, setDistribution] = useState<string>(
    node.content.ports.inputs["in-distribution"].value
  );

  useLayout(node, {
    "in-vectorSize": vectorSize,
    "in-distribution": distribution,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader label={node.content.name} className="bg-hue-250" />
      <WorkflowBody>
        <WorkflowHandle node={node} handleId="out-data" type="source">
          <WorkflowDefault label="Data" />
        </WorkflowHandle>
        <WorkflowNumber
          label="Vector size"
          number={vectorSize}
          setNumber={setVectorSize}
        />
        <WorkflowSelection
          selection={distribution}
          setSelection={setDistribution}
          label="Distribution"
          choices={["normal", "uniform"]}
        />
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
