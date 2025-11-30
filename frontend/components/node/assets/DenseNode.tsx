import { ACTIVATIONS } from "@/frontend/config/data/constants";
import { Node } from "@/frontend/types";
import { useState } from "react";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowBoolean from "../layouts/Boolean";
import WorkflowChart from "../layouts/Chart";
import WorkflowCollapsible from "../layouts/Collapsible";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";
import WorkflowNumber from "../layouts/Number";
import WorkflowSelection from "../layouts/Selection";

const DenseNodeComponent = ({ node }: { node: Node }) => {
  const { inputs, outputs } = node.content.ports;

  const [bias, setBias] = useState<boolean>(inputs["in-useBias"].value);
  const [units, setUnits] = useState<number>(inputs["in-units"].value);
  const [activation, setActivation] = useState(inputs["in-activation"].value);

  useLayout(node, {
    "in-units": units,
    "in-useBias": bias,
    "in-activation": activation,
  });

  return (
    <WorkflowNode node={node} className="relative">
      <WorkflowHeader
        label={node.content.name}
        icon={node.content.icon}
        className={"bg-hue-180"}
      />

      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-layer" node={node}>
          <WorkflowDefault>Layer</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-layer" node={node}>
          <WorkflowDefault>Layer</WorkflowDefault>
        </WorkflowHandle>

        <WorkflowNumber number={units} setNumber={setUnits} label="Units" />
        <WorkflowBoolean boolean={bias} setBoolean={setBias} label="Bias" />
        <WorkflowCollapsible label="activation">
          <WorkflowSelection
            selection={activation}
            setSelection={setActivation}
            label="Activation"
            choices={ACTIVATIONS}
          />
          <WorkflowChart functionType={activation} />
        </WorkflowCollapsible>
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
};

export default DenseNodeComponent;
