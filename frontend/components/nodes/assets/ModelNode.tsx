"use client";

// (import) hooks
import useLayout from "@/frontend/hooks/useLayout";
import { useEffect, useMemo, useState } from "react";

// (import) stores
import { useLayersStore } from "@/frontend/organism/canvas/store/layersStore";

// (import) types
import { Node } from "@/frontend/types";

// (import) parts
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";

// (import) utils
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";

const ModelNodeComponent = ({ node }: { node: Node }) => {
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
      <WorkflowHead label="Model" className="bg-hue-0" />

      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-data" node={node}>
          <WorkflowDefault label="Output" />
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-data" node={node}>
          <WorkflowDefault label="Input" />
        </WorkflowHandle>

        <WorkflowSelection
          selection={layerId}
          setSelection={setLayerId}
          choices={choices}
          labels={labels}
          label="Model"
        />
      </WorkflowBody>

      <WorkflowFooter />
    </WorkflowNode>
  );
};

export default ModelNodeComponent;
