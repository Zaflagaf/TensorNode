import { Layer, LayersStore } from "@/frontend/types";
import { produce } from "immer";
import { create } from "zustand";

import { useWorkflowStore } from "./workflowStore";
import { useZoomStore } from "./zoomStore";

import * as d3 from "d3";

export const useLayersStore = create<LayersStore>((set, get) => ({
  layers: [],
  currentLayer: undefined,

  actions: {
    setLayers: (layers) => set({ layers }),

    setLayerAttribute: (layerId, key, value) =>
      set(
        produce((draft) => {
          updateLayerAttribute(draft.layers, layerId, key, value);
        })
      ),

    addLayer: (newLayer, parentId) =>
      set(
        produce((draft) => {
          if (!parentId) {
            draft.layers.push(newLayer);
            return;
          }

          const parent = findLayer(draft.layers, parentId);
          if (!parent) return;

          if (!parent.children) parent.children = [];
          parent.children.push(newLayer);
        })
      ),

    renameLayer: (layerId, layerName) =>
      set(
        produce((draft) => {
          const layer = findLayer(draft.layers, layerId);
          if (layer) layer.name = layerName;
        })
      ),

    addNodeToLayer: (layerId, nodeId) =>
      set(
        produce((draft) => {
          const layer = findLayer(draft.layers, layerId);
          if (!layer) return;

          if (!layer.content) layer.content = [];
          layer.content.push(nodeId);
        })
      ),

    removeNodesFromLayer: (layerId, nodeIds) =>
      set(
        produce((draft) => {
          const layer = findLayer(draft.layers, layerId);
          if (!layer || !layer.content) return;

          layer.content = layer.content.filter(
            (id: string) => !nodeIds.includes(id)
          );
        })
      ),

    setCurrentLayer: (layerId) => {
      if (!layerId) {
        set({ currentLayer: undefined });
        return;
      }

      const layers = get().layers;
      const prevLayerId = get().currentLayer;

      if (!layers) return;
      const targetLayer = findLayer(layers, layerId);

      // si layer introuvable → déselection
      if (!targetLayer) {
        set({ currentLayer: undefined });
        return;
      }

      const zoomStore = useZoomStore.getState();
      const workflowRef = useWorkflowStore.getState().workflow;
      const zoom = zoomStore.zoomBehavior;

      const nextTransform = targetLayer.transform ?? { x: 0, y: 0, k: 0.5 };
      useZoomStore.setState({ transform: { ...nextTransform } });

      // appliquer sur canvas
      if (workflowRef.current && zoom) {
        const workflow = workflowRef.current;
        d3.select(workflow).call(
          zoom.transform,
          d3.zoomIdentity
            .translate(nextTransform.x, nextTransform.y)
            .scale(nextTransform.k)
        );
      }

      // sauver transform de l'ancien layer + switch
      set(
        produce((draft) => {
          if (prevLayerId) {
            const prevLayer = findLayer(draft.layers, prevLayerId);
            if (prevLayer) {
              prevLayer.transform = { ...zoomStore.transform };
            }
          }
          draft.currentLayer = layerId;
        })
      );
    },
  },
}));

export function findLayer(
  layers: Layer[],
  id: string | undefined
): Layer | undefined {
  for (const layer of layers) {
    if (layer.id === id) return layer;
    if (layer.children) {
      const result = findLayer(layer.children, id);
      if (result) return result;
    }
  }
  return undefined;
}

export function updateLayerAttribute(
  layers: Layer[],
  layerId: string,
  key: keyof Layer,
  value: any
) {
  const layer = findLayer(layers, layerId);
  if (layer) {
    (layer as any)[key] = value;
  }
}
