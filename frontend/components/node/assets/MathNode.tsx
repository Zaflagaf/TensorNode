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
import WorkflowSelection from "../layouts/Selection";

export default function MathNodeComponent({ node }: { node: Node }) {
  const { inputs, outputs } = node.content.ports;
  const [method, setMethod] = useState<string>(inputs["in-method"].value);
  const [a, setA] = useState(inputs["in-a"].value);
  const [b, setB] = useState(inputs["in-b"].value);

  useLayout(node, {
    "in-method": method,
    "in-a": a,
    "in-b": b,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader
        label={node.content.name}
        icon={node.content.icon}
        className="bg-hue-250"
      />
      <WorkflowBody>
        <WorkflowHandle node={node} handleId="out-value" type="source">
          <WorkflowDefault>Value</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowSelection
          selection={method}
          setSelection={setMethod}
          choices={["Add", "Multiply", "Substract", "Divide"]}
        />
        <WorkflowHandle node={node} handleId="in-a" type="target">
          
          {/* inputs["in-a"].states?.isBusy */ true ? (
            <WorkflowDefault>A</WorkflowDefault>
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
          {/* inputs["in-b"].states?.isBusy */ true ? (
            <WorkflowDefault>B</WorkflowDefault>
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
