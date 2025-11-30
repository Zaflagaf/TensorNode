import { createDefaultNode } from "@/frontend/lib/node&edge-logic/defaultNodes";
import { Layer, NodeType } from "@/frontend/types";
import { createId } from "./createId";
import { useZoomStore } from "@/frontend/store/zoomStore";

type NodeConfig = {
  type: NodeType;
  position: { x: number; y: number };
};

type LayerConfig = {
  name: string;
  type: string;
  content: NodeConfig[];
  transform?: { x: number; y: number; k: number };
  children?: LayerConfig[];
};

function processLayerContent(
  content: NodeConfig[],
  nodesAccumulator: Record<string, ReturnType<typeof createDefaultNode>>
): string[] {
  return content.map((item) => {
    const id = createId(); // toujours générer un ID unique
    nodesAccumulator[id] = createDefaultNode(item.type, item.position, id);
    return id;
  });
}

function createLayersRec(
  layersConfig: LayerConfig[],
  nodesAccumulator: Record<string, ReturnType<typeof createDefaultNode>>
): Layer[] {
  return layersConfig.map((layer) => {
    const id = createId();
    const contentIds = processLayerContent(layer.content, nodesAccumulator);
    const transform = useZoomStore.getState().transform
    return {
      id,
      name: layer.name,
      type: layer.type,
      content: contentIds,
      transform: layer.transform ?? transform,
      children: layer.children
        ? createLayersRec(layer.children, nodesAccumulator)
        : undefined,
    };
  });
}

export default function createDefaultWorkflow(layersConfig: LayerConfig[]) {
  const initialNodes: Record<string, ReturnType<typeof createDefaultNode>> = {};
  const initialLayers = createLayersRec(layersConfig, initialNodes);

  return { initialNodes, initialLayers };
}
