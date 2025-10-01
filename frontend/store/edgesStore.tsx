import { produce } from "immer";
import { create } from "zustand";
import { EdgeType } from "../schemas/edge";

export type EdgesType = {
  edges: Record<string, EdgeType>;
  actions: {
    setEdges: (value: Record<string, EdgeType>) => void;
    setEdge: (id: string, value: EdgeType) => void;
    getEdge: (id: string) => EdgeType | {};

    addEdge: (
      id: string,
      sourceNode: string,
      sourceHandle: string,
      targetNode: string,
      targetHandle: string
    ) => void;
    setSelectedEdge: (id: string) => void;
    clearSelectedEdge: () => void;
    removeEdge: (id: string) => void;
    removeEdgeRelativeToNode: (id: string) => void;
  };
};

export const useEdgesStore = create<EdgesType>((set, get) => ({
  edges: {},
  actions: {
    setEdges: (value) => set({ edges: value }),
    setEdge: (id, value) =>
      set(
        produce((state: EdgesType) => {
          if (!state.edges[id]) return;
          state.edges[id] = value;
        })
      ),
    getEdge: (id) => {
      const { edges } = get();
      return id in edges ? edges[id] : {};
    },
    addEdge: (id, sourceNode, sourceHandle, targetNode, targetHandle) =>
      set(
        produce((state: EdgesType) => {
          const edge = {
            id: id,
            selected: true,
            sourceNode: sourceNode,
            sourceHandle: sourceHandle,
            targetNode: targetNode,
            targetHandle: targetHandle,
            type: "NONE",
            data: "NONE",
          };
          state.edges[id] = edge;
        })
      ),

    setSelectedEdge: (id) => {
      set(
        produce((state: EdgesType) => {
          if (!state.edges[id]) return;

          Object.values(state.edges).forEach((edge) => {
            edge.selected = false;
          });
          console.log(id, true);
          state.edges[id].selected = true;
        })
      );
    },

    clearSelectedEdge: () => {
      set(
        produce((state: EdgesType) => {
          Object.values(state.edges).forEach((edge) => {
            edge.selected = false;
          });
        })
      );
    },

    removeEdge: (id: string) =>
      set(
        produce((state: EdgesType) => {
          delete state.edges[id];
        })
      ),

    removeEdgeRelativeToNode: (id) => {
      set(
        produce((state: EdgesType) => {
          for (const edgeId in state.edges) {
            const edge = state.edges[edgeId];
            if (edge.sourceNode === id || edge.targetNode === id) {
              delete state.edges[edgeId];
            }
          }
        })
      );
    },
  },
}));
