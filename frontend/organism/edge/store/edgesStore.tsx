import { EdgesStore } from "@/frontend/types";
import { produce } from "immer";
import { create } from "zustand";

export const useEdgesStore = create<EdgesStore>((set, get) => ({
  edges: {},
  actions: {
    // direct modification
    setEdges: (value) => set({ edges: value }),
    setEdge: (id, value) =>
      set(
        produce((draft) => {
          if (!draft.edges[id]) return;
          draft.edges[id] = value;
        })
      ),
    addEdge: (edgeId, source, target) =>
      set(
        produce((draft: EdgesStore) => {
          const edge = {
            id: edgeId,

            source: {
              nodeId: source.nodeId,
              handleId: source.handleId,
            },
            target: {
              nodeId: target.nodeId,
              handleId: target.handleId,
            },

            states: {
              selected: false,
            },

            content: undefined,
            metadata: undefined,
          };
          draft.edges[edgeId] = edge;
        })
      ),
    removeEdge: (edgeId: string) =>
      set(
        produce((draft: EdgesStore) => {
          delete draft.edges[edgeId];
        })
      ),
    removeEdgeRelativeToNode: (nodeId) => {
      set(
        produce((draft: EdgesStore) => {
          for (const edgeId in draft.edges) {
            const edge = draft.edges[edgeId];
            if (
              edge.source.nodeId === nodeId ||
              edge.target.nodeId === nodeId
            ) {
              delete draft.edges[edgeId];
            }
          }
        })
      );
    },
    removeEdgeRelativeToNodeAndTargetHandle: (nodeId, handleId) => {
      set(
        produce((draft: EdgesStore) => {
          for (const edgeId in draft.edges) {
            const edge = draft.edges[edgeId];
            if (
              edge.target.handleId === handleId &&
              edge.target.nodeId === nodeId
            ) {
              delete draft.edges[edgeId];
            }
          }
        })
      );
    },

    // states
    setSelectedEdge: (edgeId, value = true) => {
      set(
        produce((draft: EdgesStore) => {
          Object.values(draft.edges).forEach((edge) => {
            edge.states.selected = false;
          });
          if (!draft.edges[edgeId]) return;
          draft.edges[edgeId].states.selected = value;
        })
      );
    },
  },
}));
