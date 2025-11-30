import { createDefaultNode } from "@/frontend/lib/node&edge-logic/defaultNodes";
import { createId } from "./createId";
import { useZoomStore } from "@/frontend/store/zoomStore";
import { NodeType, Layer, Edge } from "@/frontend/types";

type CreatedNode = ReturnType<typeof createDefaultNode>;

const GRID_SIZE = 100; // 100 × 100 nodes
const SPACING = 250;   // Distance entre nodes

export default function createStressTestWorkflow() {
  // -------------------------------
  // 1. Accumulateur de nodes
  // -------------------------------
  const initialNodes: Record<string, CreatedNode> = {};

  const layerContent: { type: NodeType; position: { x: number; y: number } }[] =
    [];

  // -------------------------------
  // 2. Générer une grille (pour positions)
  // -------------------------------
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      layerContent.push({
        type: "test",
        position: {
          x: col * SPACING,
          y: row * SPACING,
        },
      });
    }
  }

  // -------------------------------
  // 3. Créer nodes réels + IDs
  // -------------------------------
  const layerNodeIds: string[] = [];

  for (const nodeDef of layerContent) {
    const id = createId();
    initialNodes[id] = createDefaultNode(nodeDef.type, nodeDef.position, id);
    layerNodeIds.push(id);
  }

  // -------------------------------
  // 4. Créer edges SEULEMENT entre node[i] → node[i+1]
  // -------------------------------
  const initialEdges: Record<string, Edge> = {};

  for (let i = 0; i < layerNodeIds.length - 1; i++) {
    const sourceId = layerNodeIds[i];
    const targetId = layerNodeIds[i + 1];

    const eid = createId();

    initialEdges[eid] = {
      id: eid,
      source: {
        nodeId: sourceId,
        handleId: "out-test",
      },
      target: {
        nodeId: targetId,
        handleId: "in-test",
      },
      states: {
        selected: false,
      },
    };
  }

  // -------------------------------
  // 5. Une seule layer
  // -------------------------------
  const layerId = createId();
  const transform = useZoomStore.getState().transform;

  const initialLayers: Layer[] = [
    {
      id: layerId,
      name: "Stress Test Linear Chain (10000 nodes)",
      type: "default",
      content: layerNodeIds,
      transform,
      children: undefined,
    },
  ];

  return {
    initialNodes,
    initialLayers,
    initialEdges,
  };
}
