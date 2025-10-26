import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";

import { Node } from "@/frontend/types";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowHeader from "../layouts/Header";

import useLayout from "@/frontend/hooks/useLayout";
import { useLayersStore } from "@/frontend/organism/canvas/store/layersStore";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";
import { useEffect, useMemo, useState } from "react";
import WorkflowSelection from "../layouts/Selection";

export default function ScoreNodeComponent({ node }: { node: Node }) {
  const layers = useLayersStore((state) => state.layers);
  const getNodes = useNodesStore((state) => state.actions.getNodes);

  // ID de la layer sélectionnée
  const [layerId, setLayerId] = useState<string>(
    node.content.ports.inputs["in-layerId"].value
  );

  // ID du modèle (output node)
  const [modelId, setModelId] = useState<string | undefined>(
    node.content.ports.inputs["in-modelId"].value
  );

  // Liste des choix pour le dropdown (string[] pour WorkflowSelection)
  const choices = useMemo(() => {
    return Object.values(layers)
      .filter((layer) => layer.type === "model")
      .map((layer) => layer.id);
  }, [layers]);

  // Labels mapping id -> name pour le dropdown
  const labels = useMemo(() => {
    const map: Record<string, string> = {};
    Object.values(layers)
      .filter((layer) => layer.type === "model")
      .forEach((layer) => {
        map[layer.id] = layer.name;
      });
    return map;
  }, [layers]);

  // Mettre à jour modelId quand layerId change
  useEffect(() => {
    if (!layerId || !layers[layerId]) return;

    const nodeIds = layers[layerId].content;
    const nodes = getNodes();

    const outputNodeId = nodeIds.find(
      (nodeId) => nodes[nodeId].type === "output"
    );
    setModelId(outputNodeId);
  }, [layerId, layers, getNodes]);

  useLayout(node, {
    "in-layerId": layerId,
    "in-modelId": modelId,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHeader label={node.content.name} className="bg-hue-250" />
      <WorkflowBody>
        <WorkflowHandle node={node} type="target" handleId="in-score">
          <WorkflowDefault label="Score" />
        </WorkflowHandle>
        <WorkflowSelection
          selection={layerId}
          setSelection={setLayerId}
          choices={choices}
          labels={labels}
          label="Model"
        />
      </WorkflowBody>
    </WorkflowNode>
  );
}
