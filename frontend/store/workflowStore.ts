import { WorkflowStore } from "@/frontend/types";
import { create } from "zustand";

("undraggable");
("undeletable");
("handle");
("node");

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflow: { current: null },
  clipboard: { nodes: [] as Node[] },
  mode: "free",
  states: {
    delta: { dx: 0, dy: 0 },
    isDown: false,
    isDragging: false,
    position: { x: 0, y: 0 },
  },
  freezeTransformClassName: {
    canvas: [
      "transform-freeze-node",
      "transform-freeze-canvas",
      "transform-freeze-all",
      "handle",
      "undraggable",
    ],
    node: ["transform-freeze-node", "transform-freeze-all", "undraggable"],
  },
  actions: {
    setWorkflow: (element) => set({ workflow: { current: element } }),
    setStates: (states) => set({ states: states }),
  },
}));
