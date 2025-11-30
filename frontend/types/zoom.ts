import { Range, Transform } from "@/frontend/types";

export type ZoomStore = {
  transform: Transform;
  zoomBehavior: d3.ZoomBehavior<HTMLDivElement, unknown> | null;
  zoomLimits: Range;
  actions: {
    setZoom: (zoom: number) => void;
    setTransform: (transform: Transform) => void;
    setZoomBehavior: (zoom: d3.ZoomBehavior<HTMLDivElement, unknown>) => void;
    focusId: (id: string, container: HTMLDivElement | null) => void;
  };
};
