import { Position } from "@/frontend/types";

export type WorkflowStates = {
  delta: { dx: number; dy: number };
  isDown: boolean;
  isDragging: boolean;
  position: Position;
};

export type WorkflowStore = {
  workflow: { current: HTMLDivElement | null };
  clipboard: Record<string, any>;
  mode: "free" | "grid";
  states: WorkflowStates;
  freezeTransformClassName: Record<string, string[]>;
  actions: {
    setWorkflow: (element: HTMLDivElement) => void;
    setStates: (states: WorkflowStates) => void;
  };
};
