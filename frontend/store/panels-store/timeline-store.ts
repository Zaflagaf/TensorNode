import { Graph, Position, TimelineStore } from "@/frontend/types";
import React from "react";
import { create } from "zustand";


const graphsProperties: Graph[] = [
  {
    name: "loss",
    visibility: true,
    color: 300,
    points: [
      { x: 0, y: -10 },
      { x: 1, y: -5 },
      { x: 2, y: -5 },
      { x: 3, y: -2 },
      { x: 4, y: -7 },
      { x: 5, y: -12 },
      { x: 6, y: -13 },
      { x: 7, y: -22 },
      { x: 8, y: -2 },
      { x: 9, y: -1 },
      { x: 10, y: -3 },
      { x: 11, y: -7 },
      { x: 12, y: -6 },
      { x: 13, y: -9 },
      { x: 14, y: -2 },
      { x: 15, y: -5 },
      { x: 16, y: -3 },
      { x: 17, y: -7 },
      { x: 18, y: -5 },
      { x: 19, y: -6 },
      { x: 20, y: -6 },
    ],
  },
  {
    name: "accuracy",
    visibility: true,
    color: 10,
    points: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 2 },
      { x: 5, y: 2 },
      { x: 6, y: 3 },
      { x: 7, y: 4 },
      { x: 8, y: 5 },
      { x: 9, y: 5 },
      { x: 10, y: 6 },
      { x: 11, y: 6 },
      { x: 12, y: 7 },
      { x: 13, y: 7 },
      { x: 14, y: 8 },
      { x: 15, y: 8 },
      { x: 16, y: 9 },
      { x: 17, y: 9 },
      { x: 18, y: 10 },
      { x: 19, y: 10 },
      { x: 20, y: 11 },
      { x: 21, y: -10 },
      { x: 22, y: 2 },
      { x: 23, y: 5 },
      { x: 24, y: 2 },
      { x: 25, y: 7 },
      { x: 26, y: 12 },
      { x: 27, y: 13 },
      { x: 28, y: 22 },
      { x: 29, y: 2 },
      { x: 30, y: 1 },
      { x: 31, y: 3 },
      { x: 32, y: 7 },
      { x: 33, y: 6 },
      { x: 34, y: 9 },
      { x: 35, y: 2 },
      { x: 36, y: 5 },
      { x: 37, y: 3 },
      { x: 38, y: 7 },
      { x: 39, y: 5 },
      { x: 40, y: 6 },
      { x: 41, y: 6 },
    ],
  },
];


const useTimelineStore = create<TimelineStore>(() => ({
  containerRef: undefined,
  graphs: [],
  cursorPosition: 0,

  minY: 0,
  maxY: 0,

  timelineStart: 0,
  timelineEnd: 32,

  ticks: 10000,
  horizontalTicks: 10,

  tickWidth: 15,
  visibleTicks: 100,
}));

export default useTimelineStore;
