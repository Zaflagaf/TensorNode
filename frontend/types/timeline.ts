import { Position } from "./geometry";

export interface Graph {
  name: string;
  visibility: boolean;
  color: number;
  points: Position[];
}

export interface GraphAtTickProps {
  tick: number;
  graph: Graph;
}

export interface TimelineProps {
  graphs: Graph[];
  onPositionChange?: (position: number) => void;
  scrollLeft?: number;
  onScrollChange?: (scrollLeft: number) => void;
}
export interface WorkflowTimelinePanelProps {
  onSeek?: (position: number) => void;
}

export interface TimelineStore {
  containerRef: React.RefObject<HTMLDivElement | null> | undefined;

  graphs: Graph[];
  cursorPosition: number;

  minY: number;
  maxY: number;

  timelineStart: number;
  timelineEnd: number;

  ticks: number;
  horizontalTicks: number;
  tickWidth: number;
  visibleTicks: number;
}
