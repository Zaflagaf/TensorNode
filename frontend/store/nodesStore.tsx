// (import) bibliotheques externes
import { produce } from "immer";
import { create } from "zustand";

// (import) types
import { NodeType } from "../schemas/node";

export type NodesType = {
  nodes: Record<string, NodeType>;
  nodesPosition: Record<string, { x: number; y: number }>;
  actions: {
    setNodes: (value: Record<string, NodeType>) => void;
    setNode: (id: string, value: NodeType) => void;
    getNode: (id: string) => NodeType | {};

    addNode: (id: string, parameters: any) => void;
    removeNode: (id: string) => void;

    setNodePos: (id: string, x: number, y: number) => void;
    setNodeBox: (id: string, width: number, height: number) => void;
    setNodeInput: (id: string, key: string, value: any) => void;
    setNodeOutput: (id: string, key: string, value: any) => void;
  };
};

export const useNodesStore = create<NodesType>((set, get) => ({
  nodes: {},
  nodesPosition: {},
  actions: {
    setNodes: (value) => {
      set(
        produce((state) => {
          for (const [id, node] of Object.entries(value)) {
            const { position, ...rest } = node;

            // Mettre à jour nodes seulement si différent
            const prevNode = state.nodes[id];
            if (
              !prevNode ||
              JSON.stringify(prevNode) !== JSON.stringify(rest)
            ) {
              state.nodes[id] = rest;
            }

            // Mettre à jour position seulement si différent
            if (position !== undefined) {
              const prevPos = state.nodesPosition[id];
              if (
                !prevPos ||
                prevPos.x !== position.x ||
                prevPos.y !== position.y
              ) {
                state.nodesPosition[id] = position;
              }
            }
          }
        })
      );
    },

    setNode: (id, value) => {
      set(
        produce((state) => {
          if (!state.nodes[id]) return;
          const { position, ...rest } = value;

          const prevNode = state.nodes[id];
          if (JSON.stringify(prevNode) !== JSON.stringify(rest)) {
            state.nodes[id] = rest;
          }

          if (position !== undefined) {
            const prevPos = state.nodesPosition[id];
            if (
              !prevPos ||
              prevPos.x !== position.x ||
              prevPos.y !== position.y
            ) {
              state.nodesPosition[id] = position;
            }
          }
        })
      );
    },

    getNode: (id) => {
      const { nodes } = get();
      return id in nodes ? nodes[id] : {};
    },

    addNode: (id, parameters) => {
      set(
        produce((state: NodesType) => {
          state.nodes[id] = parameters;
        })
      );
    },

    removeNode: (id) => {
      set(
        produce((state: NodesType) => {
          delete state.nodes[id];
        })
      );
    },

    setNodePos: (id, x, y) => {
      set(
        produce((state: NodesType) => {
          if (!state.nodes[id]) return;
          state.nodesPosition[id].x = x;
          state.nodesPosition[id].y = y;
        })
      );
    },

    setNodeBox: (id, width, height) => {
      set(
        produce((state: NodesType) => {
          if (!state.nodes[id]) return;
          state.nodes[id].content.width = width;
          state.nodes[id].content.height = height;
        })
      );
    },

    setNodeInput: (id, key, value) => {
      set(
        produce((state: NodesType) => {
          if (!state.nodes[id]) return;
          state.nodes[id].content.ports.inputs[key] = value;
        })
      );
    },

    setNodeOutput: (id, key, value) => {
      set(
        produce((state: NodesType) => {
          if (!state.nodes[id]) return;
          state.nodes[id].content.ports.outputs[key] = value;
        })
      );
    },
  },
}));
