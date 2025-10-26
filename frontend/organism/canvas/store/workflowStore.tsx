import { create } from "zustand";
import { WorkflowStore } from "@/frontend/types"


export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflow: { current: null },
  states: {
    delta: { dx: 0, dy: 0 },
    isDown: false,
    isDragging: false,
    position: { x: 0, y: 0 },
  },
  freezeTransformClassName: {
    canvas: ["transform-freeze-node", "transform-freeze-canvas", "transform-freeze-all", "handle", "undraggable"],
    node: ["transform-freeze-node", "transform-freeze-all", "undraggable"],
  },
  actions: {
    setWorkflow: (element) => set({ workflow: { current: element } }),
    setStates: (states) => set({ states: states }),
  },
}));
