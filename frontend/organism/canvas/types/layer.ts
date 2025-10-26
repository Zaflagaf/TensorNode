import { Transform } from "@/frontend/types";

export interface CompositorLayer {
  id: string;
  name: string;
  type: string;
  content: string[];
  metadata?: object;
  transform: Transform;
}

export interface ModelLayer {
  id: string;
  name: string;
  type: string;
  model: string | null;
  content: string[];
  metadata?: object;
  transform: Transform;
}

export type Layer = CompositorLayer | ModelLayer;

export type Layers = Record<string, Layer>;

export interface LayersStore {
  layers: Layers;
  currentLayer: string | undefined;
  actions: {
    setLayers: (layers: Layers) => void;
    addLayer: (layerId: string, layer: Layer) => void;
    renameLayer: (layerId: string, layerName: string) => void;
    addNodeToLayer: (layerId: string, nodeId: string) => void;
    removeNodeFromLayer: (layerId: string, nodeId: string) => void;
    setCurrentLayer: (layerId: string | undefined) => void;
  };
}