"use client";

// (import) bibliotheques externes
import useLayout from "@/frontend/hooks/useLayout";
import { useState } from "react";

// (import) types
import { Node } from "@/frontend/types";
// (import) useStores

// (import) parts
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";

// (import) layouts
import WorkflowBody from "../layouts/Body";
import WorkflowBoolean from "../layouts/Boolean";
import WorkflowChart from "../layouts/Chart";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";
import WorkflowNumber from "../layouts/Number";
import WorkflowSelection from "../layouts/Selection";

import { ACTIVATIONS } from "@/frontend/config/data/constants";

const DenseNodeComponent = ({ node }: { node: Node }) => {
  const [bias, setBias] = useState<boolean>(
    node.content.ports.inputs["in-useBias"].value
  );
  const [units, setUnits] = useState<number>(
    node.content.ports.inputs["in-units"].value
  );
  const [activation, setActivation] = useState<string>(
    node.content.ports.inputs["in-activation"].value
  );

  useLayout(node, {
    "in-units": units,
    "in-useBias": bias,
    "in-activation": activation,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader label={node.content.name} className={"bg-hue-180"} />

      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-layer" node={node}>
          <WorkflowDefault label="Layer" />
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-layer" node={node}>
          <WorkflowDefault label="Layer" />
        </WorkflowHandle>

        <WorkflowNumber number={units} setNumber={setUnits} label="Units" />

        <WorkflowBoolean boolean={bias} setBoolean={setBias} label="Bias" />
        {/*           <WorkflowVector vector={{"Vec1": 2, "Vec2": 15, "Vec3": 1001}}/> */}
        <WorkflowSelection
          selection={activation}
          setSelection={setActivation}
          label="Activation"
          choices={ACTIVATIONS}
        />
        <WorkflowChart functionType={activation} />
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
};

export default DenseNodeComponent;
