import { create } from "zustand";

export type WorkflowStatesType = {
  delta: { dx: number; dy: number };
  isDown: boolean;
  isDragging: boolean;
  position: { x: number; y: number };
};

export type WorkflowType = {
  workflow: { current: HTMLDivElement | null };
  states: WorkflowStatesType;
  actions: {
    setWorkflow: (element: HTMLDivElement) => void;
    setStates: (states: WorkflowStatesType) => void;
  };
};

export const useWorkflowStore = create<WorkflowType>((set) => ({
  workflow: { current: null },
  states: {
    delta: { dx: 0, dy: 0 },
    isDown: false,
    isDragging: false,
    position: { x: 0, y: 0 },
  },
  actions: {
    setWorkflow: (element) => set({ workflow: { current: element } }),
    setStates: (states) => set({ states: states }),
  },
}));
