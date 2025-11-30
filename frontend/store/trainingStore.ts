// store/trainingStore.ts
import { ButtonStatus } from "@/frontend/types";
import { create } from "zustand";

// --- Types --- //
export interface TrainingStore {
  connected: boolean;
  status: ButtonStatus;
  problemNodes: string[];
  epoch: number;
  totalEpochs: number;
  history: Record<string, number[]>;
  setState: (state: any) => void;
}

// --- Store --- //
export const useTrainingStore = create<TrainingStore>((set) => ({
  connected: false,
  status: ButtonStatus.idle,
  problemNodes: [],
  epoch: 0,
  totalEpochs: 32,
  history: {},
  setState: (state) =>
    set((prev) => ({ ...prev, ...state })),
}));