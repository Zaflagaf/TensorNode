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
}
export interface Transform extends Position {
  k: number;
}

export interface Range {
  min: number;
  max: number;
}
