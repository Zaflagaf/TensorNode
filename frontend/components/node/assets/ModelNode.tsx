import { Layer, Node } from "@/frontend/types";
import { useEffect, useMemo, useRef, useState } from "react";

import { findLayer, useLayersStore } from "@/frontend/store/layersStore";
import { useNodesStore } from "@/frontend/store/nodesStore";

import useLayout from "@/frontend/hooks/useLayout";

import WorkflowHandle from "@/frontend/components/handle/Handle";
import WorkflowNode from "@/frontend/components/node/Node";
import { useTrainingProgress } from "@/frontend/hooks/useTrainingProgress";
import { predict } from "@/frontend/lib/fetch/api";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowSelection from "../layouts/Selection";

const ModelNodeComponent = ({ node }: { node: Node }) => {
  const { inputs, outputs } = node.content.ports;
  const layers = useLayersStore((state) => state.layers);
  const getNodes = useNodesStore((state) => state.actions.getNodes);
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);

  const { setOnEpochEnd } = useTrainingProgress();

  const [layerId, setLayerId] = useState<string>(inputs["in-layerId"].value);
  const [modelId, setModelId] = useState<string | undefined>(
    inputs["in-modelId"].value
  );

  const runningRef = useRef(false);

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

  // Mettre à jour modelId quand layerId change
  useEffect(() => {
    const layer = findLayer(layers, layerId);
    if (!layer) return;

    const nodeIds = layer.content;
    const nodes = getNodes();

    const outputNodeId = nodeIds.find(
      (nodeId) => nodes[nodeId].type === "output"
    );
    setModelId(outputNodeId);
  }, [layerId, layers]);

  const runPrediction = async () => {
    if (runningRef.current) return;
    if (!modelId) return;

    runningRef.current = true;
    try {
      const inputData = inputs["in-data"].value;
      const outputData = await predict(modelId, inputData);
      setNodeOutput(node.id, "out-data", outputData);
    } finally {
      runningRef.current = false;
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      runPrediction();
    }, 300); // attendre 300ms avant d'envoyer

    return () => clearTimeout(handler);
  }, [inputs["in-data"].value, inputs["in-buildId"].value]);

  useEffect(() => {
    setOnEpochEnd(async (epoch, history) => {
      if (epoch % 5 !== 0) return; // exemple : update tous les 5 epochs
      await runPrediction();
    });
  }, [setOnEpochEnd]);

  useLayout(node, {
    "in-layerId": layerId,
    "in-modelId": modelId,
  });

  return (
    <WorkflowNode node={node}>
      <WorkflowHead label="Model" className="bg-hue-0" />

      <WorkflowBody>
        <WorkflowHandle type="source" handleId="out-data" node={node}>
          <WorkflowDefault>Output</WorkflowDefault>
        </WorkflowHandle>
        <WorkflowHandle type="target" handleId="in-data" node={node}>
          <WorkflowDefault>Input</WorkflowDefault>
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
