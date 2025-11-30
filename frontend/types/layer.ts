import { Transform } from "@/frontend/types";

export interface BaseLayer {
  id: string;
  name: string;
  type: string;
  content: string[];
  metadata?: object;
  transform: Transform;
}

export interface CompositorLayer extends BaseLayer {}

export interface ModelLayer extends BaseLayer {
  model?: string | null;
}

export interface Layer extends ModelLayer {
  id: string;
  name: string;
  type: "model" | "compositor" | string;
  content: string[];
  transform: { x: number; y: number; k: number };
  children?: Layer[];
}

export interface LayersStore {
  layers: Layer[];
  currentLayer: string | undefined;
  actions: {
    setLayers: (layers: Layer[]) => void;
    setLayerAttribute: (layerId: string, key: keyof Layer, value: any) => void;
    addLayer: (layer: Layer, parentId?: string) => void;
    renameLayer: (layerId: string, layerName: string) => void;
    addNodeToLayer: (layerId: string, nodeId: string) => void;
    removeNodesFromLayer: (layerId: string, nodeId: string[]) => void;
    setCurrentLayer: (layerId: string | undefined) => void;
  };
}
