import { ACTIVATIONS } from "@/frontend/config/data/constants";
import { Node } from "@/frontend/types";
import { useState } from "react";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowChart from "../layouts/Chart";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";
import WorkflowNumber from "../layouts/Number";
import WorkflowSelection from "../layouts/Selection";
import WorkflowTensor from "../layouts/Tensor";

export default function Conv2DTransposeNodeComponent({ node }: { node: Node }) {
  const [filters, setFilters] = useState<number>(
    node.content.ports.inputs["in-filters"].value
  );
  const [kernelSize, setKernelSize] = useState<number[]>(
    node.content.ports.inputs["in-kernelSize"].value
  );
  const [strides, setStrides] = useState<number[]>(
    node.content.ports.inputs["in-strides"].value
  );
  const [padding, setPadding] = useState<string>(
    node.content.ports.inputs["in-padding"].value
  ); // "valid" | "same"
  const [activation, setActivation] = useState(
    node.content.ports.inputs["in-activation"].value
  );

  useLayout(node, {
    "in-filters": filters,
    "in-kernelSize": kernelSize,
    "in-strides": strides,
    "in-padding": padding,
    "in-activation": activation,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader
        label={node.content.name}
        icon={node.content.icon}
        className="bg-hue-180"
      />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-layer" node={node}>
          <WorkflowDefault>
            Layer
          </WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-layer" node={node}>
          <WorkflowDefault>
            Layer
          </WorkflowDefault>
        </WorkflowHandle>
        <WorkflowNumber
          number={filters}
          setNumber={setFilters}
          label="Filters"
        />

        <WorkflowTensor
          label="Kernel Size"
          tensor={kernelSize}
          setTensor={setKernelSize}
          type="int"
        />
        <WorkflowTensor
          label="Strides"
          tensor={strides}
          setTensor={setStrides}
          type="int"
        />
        <WorkflowSelection
          selection={padding}
          setSelection={setPadding}
          choices={["valid", "same"]}
        />
        <WorkflowSelection
          selection={activation}
          setSelection={setActivation}
          label="Activation"
          choices={ACTIVATIONS}
        />
        <WorkflowChart functionType={activation} />
      </WorkflowBody>
      <WorkflowFooter></WorkflowFooter>
    </WorkflowNode>
  );
}
