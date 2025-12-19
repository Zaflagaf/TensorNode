import { computeOutputs } from "@/frontend/lib/fetch/api";
import { useEdgesStore } from "@/frontend/store/edgesStore";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { Node } from "@/frontend/types";
import { MousePointerClick, Sparkles } from "lucide-react";
import { useState } from "react";
import WorkflowHandle from "../../handle/Handle";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";
import WorkflowDataShower from "../layouts/Shower";
import WorkflowNode from "../Node";

const choices = {
  Raw: ["Raw", "JSON", "Array"],
  Image: ["RGB", "Grayscale", "Heatmap"],
  Sequence: ["Text", "Tokens", "Array", "Graph"],
  Audio: ["Waveform", "Spectrogram"],
  Table: ["Table", "Array", "Heatmap"],
  Scalar: ["Value", "Gauge", "Bar"],
  Embedding: ["Projection", "Array", "Heatmap"],
  Mask: ["Binary", "Overlay", "Array"],
};

export default function ViewerNodeComponent({ node }: { node: Node }) {
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);

  const { inputs, outputs } = node.content.ports;

  const [method, setMethod] = useState(inputs["in-method"].value);

  const handleClick = async () => {
    const nodes = useNodesStore.getState().nodes;
    const edges = useEdgesStore.getState().edges;
    const data = await computeOutputs(node.id, nodes, edges);
    setNodeOutput(node.id, "out-data", data["out-data"]);
  };

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader
        label={node.content.name}
        icon={node.content.icon}
        className="bg-hue-250"
      />
      <WorkflowBody>
        <WorkflowHandle node={node} handleId="in-data" type="target">
          <WorkflowDefault>Data</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowSelection
          selection={method}
          setSelection={setMethod}
          choices={choices}
        />
        <div
          className="text-xxs text-muted-foreground bg-muted/75 rounded-xs py-[2px] px-[8px] flex gap-[4px] items-center cursor-pointer"
          onClick={handleClick}
        >
          <Sparkles className="size-3" /> Compute
        </div>
        <WorkflowDataShower data={outputs["out-data"].value} />
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
