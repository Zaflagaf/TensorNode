import { Layer, Node } from "@/frontend/types";
import { useEffect, useMemo, useState } from "react";

import { findLayer, useLayersStore } from "@/frontend/store/layersStore";
import { useNodesStore } from "@/frontend/store/nodesStore";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowBoolean from "../layouts/Boolean";
import WorkflowCollapsible from "../layouts/Collapsible";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowFreeze from "../layouts/Freeze";
import WorkflowHeader from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";
import WorkflowString from "../layouts/String";

export default function ScoreNodeComponent({ node }: { node: Node }) {
  const layers = useLayersStore((state) => state.layers);
  const getNodes = useNodesStore((state) => state.actions.getNodes);
  const { inputs, outputs } = node.content.ports;

  const [layerId, setLayerId] = useState<string>(inputs["in-layerId"].value);
  const [modelId, setModelId] = useState<string | undefined>(inputs["in-modelId"].value);
  const [isTracking, setIsTracking] = useState<boolean>(inputs["in-isTracking"].value);
  const [trackingName, setTrackingName] = useState<string>(inputs["in-trackingName"].value);

  const choices = useMemo(() => {
    const names: string[] = [];

    const traverse = (layer: Layer) => {
      if (layer.type === "model") names.push(layer.id);
      if (layer.children?.length) layer.children.forEach(traverse);
    };

    Object.values(layers).forEach(traverse);
    return names;
  }, [layers]);

  const labels = useMemo(() => {
    const map: Record<string, string> = {};

    const traverse = (layer: Layer) => {
      if (layer.type === "model") map[layer.id] = layer.name;
      if (layer.children?.length) layer.children.forEach(traverse);
    };

    Object.values(layers).forEach(traverse);
    return map;
  }, [layers]);

  useEffect(() => {
    if (!layerId) return;

    const layer = findLayer(layers, layerId);
    if (!layer) return;

    const nodeIds = layer.content;
    const nodes = getNodes();

    const outputNodeId = nodeIds.find(
      (nodeId) => nodes[nodeId].type === "output"
    );

    setModelId(outputNodeId);
  }, [layerId, layers, getNodes]);

  useLayout(node, {
    "in-layerId": layerId,
    "in-modelId": modelId,
    "in-isTracking": isTracking,
    "in-trackingName": trackingName,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader
        label={node.content.name}
        icon={node.content.icon}
        className="bg-hue-250"
      />
      <WorkflowBody>
        <WorkflowHandle node={node} type="target" handleId="in-score">
          <WorkflowDefault>Score</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowSelection
          selection={layerId}
          setSelection={setLayerId}
          choices={choices}
          labels={labels}
          label="Model"
        />
        <WorkflowCollapsible label="Metrics">
          <WorkflowBoolean
            boolean={isTracking}
            setBoolean={setIsTracking}
            label="Track"
          />
          <WorkflowFreeze value={isTracking}>
            <WorkflowString
              value={trackingName}
              setValue={setTrackingName}
              label="Tracking Name"
            />
          </WorkflowFreeze>
        </WorkflowCollapsible>
      </WorkflowBody>
      <WorkflowFooter />
    </WorkflowNode>
  );
}
