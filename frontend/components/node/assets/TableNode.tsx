import { Node } from "@/frontend/types";
import { useMemo, useState } from "react";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";

import useDataStore from "../../ui/workflow-interface/panel/properties-panel/data-tab/data-store";
import WorkflowSelection from "../layouts/Selection";

export default function TableNodeComponent({ node }: { node: Node }) {
  const { inputs, outputs } = node.content.ports;

  const [fileName, setFileName] = useState<string>(
    inputs["in-fileName"].value ?? undefined
  );

  const [features, setFeatures] = useState(inputs["in-features"]);
  const [labels, setLabels] = useState(inputs["in-labels"]);

  const datasets = useDataStore((state) => state.datasets);
  const choices = useMemo(() => Object.keys(datasets), [datasets]);

  useLayout(node, {
    "in-fileName": fileName,
    "out-features": features,
    "out-labels": labels,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHead
        label={node.content.name}
        icon={node.content.icon}
        className="bg-hue-130"
      />
      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-features" node={node}>
          <WorkflowDefault>Features</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle type="source" handleId="out-labels" node={node}>
          <WorkflowDefault>Labels</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowSelection
          selection={fileName}
          setSelection={setFileName}
          choices={choices}
          label={"Dataset"}
        />
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
