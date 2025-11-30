// (import) bibliothèques externes
import { produce } from "immer";
import { create } from "zustand";

// (import) types
import { NodesStore } from "@/frontend/types";

export const useNodesStore = create<NodesStore>((set, get) => ({
  nodes: {},
  selectedNodes: [],
  problematicNodes: [],
  actions: {
    /** 🔹 Récupère les nodes actuels */
    getNodes: () => get().nodes,

    /** 🔹 Définit tous les nodes (remplace) */
    setNodes: (nodes) => {
      set((state) =>
        produce(state, (draft: NodesStore) => {
          if (draft.nodes !== nodes) {
            draft.nodes = nodes;
          }
        })
      );
    },

    /** 🔹 Définit un node entier */
    setNode: (nodeId, node) => {
      set((state) =>
        produce(state, (draft: NodesStore) => {
          draft.nodes[nodeId] = node;
        })
      );
    },

    /** 🔹 Ajoute un node */
    addNode: (nodeId, parameters) => {
      set((state) =>
        produce(state, (draft: NodesStore) => {
          draft.nodes[nodeId] = parameters;
        })
      );
    },

    removeNodes: (nodeIds: string[]) => {
      set((state) =>
        produce(state, (draft: NodesStore) => {
          nodeIds.forEach((id) => {
            delete draft.nodes[id];

            // Supprime également de selectedNodes
            const selectedIndex = draft.selectedNodes.indexOf(id);
            if (selectedIndex !== -1) {
              draft.selectedNodes.splice(selectedIndex, 1);
            }

            // Supprime également de problematicNodes si utilisé
            const problemIndex = draft.problematicNodes.indexOf(id);
            if (problemIndex !== -1) {
              draft.problematicNodes.splice(problemIndex, 1);
            }
          });
        })
      );
    },

    /** 🔹 Ajoute un ou plusieurs nodes à la sélection */
    addSelectedNodes: (nodeIds: string[], value = true) => {
      set((state) =>
        produce(state, (draft: NodesStore) => {
          nodeIds.forEach((nodeId) => {
            if (draft.nodes[nodeId] && !draft.selectedNodes.includes(nodeId)) {
              draft.selectedNodes.push(nodeId);
            }
          });
        })
      );
    },
    /** 🔹 Modifie un input d’un node */
    setNodeInput: (nodeId, key, value) => {
      set((state) =>
        produce(state, (draft: NodesStore) => {
          const node = draft.nodes[nodeId];
          if (!node?.content?.ports?.inputs?.[key]) return;
          node.content.ports.inputs[key].value = value;
        })
      );
    },

    /** 🔹 Modifie un output d’un node (forme fonctionnelle) */
    setNodeOutput: (nodeId, key, value) => {
      set((state) =>
        produce(state, (draft: NodesStore) => {
          const node = draft.nodes[nodeId];
          if (!node?.content?.ports?.outputs?.[key]) return;
          node.content.ports.outputs[key].value = value;
        })
      );
    },

    /** 🔹 Met à jour l’état d’un handle */
    setHandleState: (nodeId, handleType, handleId, stateKey, value) => {
      set((state) =>
        produce(state, (draft: NodesStore) => {
          const port =
            draft.nodes[nodeId]?.content?.ports?.[handleType]?.[handleId];
          if (!port.states) return;
          port.states[stateKey] = value;
        })
      );
    },

    /** 🔹 Déplace un node */
    setNodePos: (nodeId, x, y) => {
      set((state) =>
        produce(state, (draft: NodesStore) => {
          const node = draft.nodes[nodeId];
          if (!node) return;
          node.box.position = { x, y };
        })
      );
    },

    /** 🔹 Met à jour les dimensions d’un node */
    setNodeBounds: (nodeId, width, height) => {
      set((state) =>
        produce(state, (draft: NodesStore) => {
          const node = draft.nodes[nodeId];
          if (!node) return;
          node.box.width = width;
          node.box.height = height;
        })
      );
    },
  },
}));
