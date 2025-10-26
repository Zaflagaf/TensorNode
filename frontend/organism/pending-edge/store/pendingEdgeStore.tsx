import { PendingEdgeStore } from "@/frontend/types";
import { create } from "zustand";

export const usePendingEdgeStore = create<PendingEdgeStore>((set, get) => ({
  pendingEdge: null,
  actions: {
    setPendingEdge: (pendingEdge) => set({ pendingEdge: pendingEdge }),
  },
}));
