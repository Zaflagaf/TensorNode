import { LOSSES } from "@/frontend/config/data/constants";
import { Node } from "@/frontend/types";
import { useState } from "react";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";

const LossFunctionNodeComponent = ({ node }: { node: Node }) => {
  const [loss, setLoss] = useState<string>(
    node.content.ports.inputs["in-loss"].value
  );

  useLayout(node, {
    "in-loss": loss,
  });

  return (
    <WorkflowNode node={node}>
      <div className="w-[250px]">
        <WorkflowHead
          label={node.content.name}
          icon={node.content.icon}
          className={"bg-hue-20"}
        />
        <WorkflowBody>
          <WorkflowHandle type="source" handleId="out-loss" node={node}>
            <WorkflowDefault>
              Loss
            </WorkflowDefault>
          </WorkflowHandle>
          <WorkflowHandle type="target" handleId="in-prediction" node={node}>
            <WorkflowDefault>
              Prediction
            </WorkflowDefault>
          </WorkflowHandle>

          <WorkflowHandle type="target" handleId="in-labels" node={node}>
            <WorkflowDefault>
              Expected
            </WorkflowDefault>
          </WorkflowHandle>
          <WorkflowSelection
            label="loss function"
            selection={loss}
            setSelection={setLoss}
            choices={LOSSES}
          />
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
};

export default LossFunctionNodeComponent;
