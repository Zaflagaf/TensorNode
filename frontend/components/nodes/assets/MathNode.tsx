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

export default function MathNodeComponent({ node }: { node: Node }) {
  const [method, setMethod] = useState<string>(
    node.content.ports.inputs["in-method"].value
  );
  const [a, setA] = useState(node.content.ports.inputs["in-a"].value);
  const [b, setB] = useState(node.content.ports.inputs["in-b"].value);

  useLayout(node, {
    "in-method": method,
    "in-a": a,
    "in-b": b,
  });

  console.log(node.content.ports.inputs["in-a"])

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader label={node.content.name} className="bg-hue-250" />
      <WorkflowBody>
        <WorkflowHandle node={node} handleId="out-value" type="source">
          <WorkflowDefault label="Value" />
        </WorkflowHandle>
        <WorkflowSelection
          selection={method}
          setSelection={setMethod}
          choices={["Add", "Multiply", "Substract", "Divide"]}
        />
        <WorkflowHandle node={node} handleId="in-a" type="target">
          {node.content.ports.inputs["in-a"].states?.isBusy ? (
            <WorkflowDefault label="A" />
          ) : (
            <WorkflowNumber
              label="A"
              number={a}
              setNumber={setA}
              type="float"
            />
          )}
        </WorkflowHandle>
        <WorkflowHandle node={node} handleId="in-b" type="target">
          {node.content.ports.inputs["in-b"].states?.isBusy ? (
            <WorkflowDefault label="B" />
          ) : (
            <WorkflowNumber
              label="B"
              number={b}
              setNumber={setB}
              type="float"
            />
          )}
        </WorkflowHandle>
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
