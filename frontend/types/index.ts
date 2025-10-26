export type * from "@/frontend/organism/canvas/types/layer";
export type * from "@/frontend/organism/canvas/types/workflow";
export type * from "@/frontend/organism/canvas/types/zoom";
export type * from "@/frontend/organism/edge/types";
export type * from "@/frontend/organism/handle/types";
export type * from "@/frontend/organism/node/types";
export type * from "@/frontend/organism/pending-edge/types";

export type ButtonStatus = "idle" | "loading" | "success" | "error";
export interface Position {
  x: number;
  y: number;
}
export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
};
export interface Transform extends Position {
  k: number;
}
export interface Range {
  min: number;
  max: number;
}
