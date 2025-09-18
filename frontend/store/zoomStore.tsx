import * as d3 from "d3";
import { create } from "zustand";

export type ZoomType = {
  zoom: number;
  zoomRef: { current: number };
  transform: { x: number; y: number; k: number };
  transformRef: { current: { x: number; y: number; k: number } };
  zoomBehavior: d3.ZoomBehavior<HTMLDivElement, unknown> | null; // 👈 le vrai zoom d3
  actions: {
    setZoom: (newZoom: number) => void;
    setTransform: (t: { x: number; y: number; k: number }) => void;
    setZoomBehavior: (zoom: d3.ZoomBehavior<HTMLDivElement, unknown>) => void; // 👈 setter
    focusId: (id: string, container: HTMLDivElement | null) => void;
  };
};

export const useZoomStore = create<ZoomType>((set, get) => ({
  zoom: 1,
  zoomRef: { current: 1 },
  transform: { x: 0, y: 0, k: 1 },
  transformRef: { current: { x: 0, y: 0, k: 1 } },
  zoomBehavior: null,
  actions: {
    setZoom: (newZoom) =>
      set((state) => {
        state.zoomRef.current = newZoom;
        return { zoom: newZoom };
      }),
    setTransform: (t) =>
      set((state) => {
        state.transformRef.current = t;
        return { transform: t };
      }),

    setZoomBehavior: (zoom) =>
      set(() => ({
        zoomBehavior: zoom,
      })),

    focusId: (id, container) => {
      if (!container) return;
      const zoomBehavior = get().zoomBehavior;
      const transform = get().transform;
      if (!zoomBehavior) return;

      const element = document.getElementById(id);
      if (!element) return;

      const bbox = element.getBoundingClientRect();
      const containerBox = container.getBoundingClientRect();

      // Zoom cible
      const zoomK = 0.75;

      // Calcul du centre du node par rapport au container
      const targetX = bbox.left + bbox.width / 2;
      const targetY = bbox.top + bbox.height / 2;

      // Coordonnées relatives au container en tenant compte du zoom courant
      const relativeX =
        (targetX - containerBox.left - transform.x) / transform.k;
      const relativeY =
        (targetY - containerBox.top - transform.y) / transform.k;

      // Nouveau transform D3
      const newTransform = d3.zoomIdentity
        .translate(
          containerBox.width / 2 - relativeX * zoomK,
          containerBox.height / 2 - relativeY * zoomK
        )
        .scale(zoomK);

      // Applique zoom + translate en une seule transition
      d3.select(container)
        .transition()
        .duration(500)
        .call(zoomBehavior.transform as any, newTransform);
    },
  },
}));
