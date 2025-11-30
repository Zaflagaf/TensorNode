import { Position } from "@/frontend/types";
import { create } from "zustand";

interface MouseStore {
  mousePosition: Position;
}

export const useMouseStore = create<MouseStore>(() => ({
  mousePosition: { x: 0, y: 0 },
}));