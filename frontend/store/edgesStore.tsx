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
    removeEdge: (id: string) => void;
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
    removeEdge: (id) =>
      set((state) => {
        const newEdges = { ...state.edges };
        delete newEdges[id];
        return { edges: newEdges };
      }),
  },
}));
