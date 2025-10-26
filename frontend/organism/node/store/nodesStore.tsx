// (import) bibliotheques externes
import { produce } from "immer";
import { create } from "zustand";

// (import) types
import { NodesStore } from "@/frontend/types";

export const useNodesStore = create<NodesStore>((set, get) => ({
  nodes: {},
  actions: {
    getNodes: () => get().nodes,
    setNodes: (nodes) => set({ nodes: nodes }),
    setNode: (nodeId, node) => {
      set(
        produce((draft: NodesStore) => {
          draft.nodes[nodeId] = node;
        })
      );
    },
    addNode: (nodeId, parameters) => {
      set(
        produce((draft: NodesStore) => {
          draft.nodes[nodeId] = parameters;
        })
      );
    },
    removeNode: (nodeId) => {
      set(
        produce((draft: NodesStore) => {
          delete draft.nodes[nodeId];
        })
      );
    },
    setSelectedNode: (nodeId = "", value = true) => {
      set(
        produce((draft: NodesStore) => {
          Object.values(draft.nodes).forEach((node) => {
            node.states.selected = false;
          });
          if (!draft.nodes[nodeId]) return;
          draft.nodes[nodeId].states.selected = value;
        })
      );
    },
    setNodeInput: (nodeId, key, value) => {
      set(
        produce((draft: NodesStore) => {
          const node = draft.nodes[nodeId];
          if (!node || !key) return;

          node.content.ports.inputs[key].value = value;
        })
      );
    },
    setNodeOutput: (nodeId, key, value) => {
      set(
        produce((draft: NodesStore) => {
          const node = draft.nodes[nodeId];

          node.content.ports.outputs[key].value = value;
        })
      );
    },
    setHandleState: (nodeId, handleType, handleId, state, value) => {
      set(
        produce((draft: NodesStore) => {
          const node = draft.nodes[nodeId];
          if (!node) return;

          const ports = node.content.ports;

          ports[handleType][handleId].states[state] = value;
        })
      );
    },
    setNodeState: (nodeId, state, value) => {
      set(
        produce((draft: NodesStore) => {
          draft.nodes[nodeId].states[state] = value
        })
      );
    },

    setNodePos: (nodeId, x, y) => {
      set(
        produce((draft: NodesStore) => {
          if (!draft.nodes[nodeId]) return;

          draft.nodes[nodeId].box.position = { x, y };
        })
      );
    },
    setNodeBounds: (nodeId, width, height) => {
      set(
        produce((draft: NodesStore) => {
          if (!draft.nodes[nodeId]) return;
          draft.nodes[nodeId].box.width = width;
          draft.nodes[nodeId].box.height = height;
        })
      );
    },
  },
}));
