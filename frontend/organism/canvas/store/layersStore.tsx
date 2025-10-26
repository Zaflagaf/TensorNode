import { LayersStore } from "@/frontend/types";
import { produce } from "immer";
import { create } from "zustand";

import { initialLayers } from "@/frontend/config/data/data";

export const useLayersStore = create<LayersStore>((set) => ({
  layers: initialLayers,
  currentLayer: undefined,
  actions: {
    setLayers: (layers) => set({ layers: layers }),
    addLayer: (layerId, layer) => {
      set(
        produce((draft) => {
          draft.layers[layerId] = layer;
        })
      );
    },
    renameLayer: (layerId, layerName) => {
      set(produce((draft) => (draft.layers[layerId].name = layerName)));
    },
    addNodeToLayer: (layerId, nodeId) =>
      set(
        produce((draft) => {
          if (!draft.layers[layerId].content)
            draft.layers[layerId].content = []; // sécurité
          draft.layers[layerId].content.push(nodeId);
        })
      ),
    removeNodeFromLayer: (layerId, nodeId) =>
      set(
        produce((draft) => {
          if (!draft.layers[layerId].content)
            draft.layers[layerId].content = [];
          draft.layers[layerId].content = draft.layers[layerId].content.filter(
            (id: string) => id !== nodeId
          );
        })
      ),
    setCurrentLayer: (layerId) => set({ currentLayer: layerId }),
  },
}));
