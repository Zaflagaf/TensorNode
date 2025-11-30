import * as d3 from "d3";
import { produce } from "immer";
import { create } from "zustand";
import { ZoomStore } from "@/frontend/types"

export const useZoomStore = create<ZoomStore>((set, get) => ({
  transform: { x: 0, y: 0, k: 1 },
  zoomLimits: { min: 0.2, max: 2 },
  zoomBehavior: null,
  actions: {
    setZoom: (zoom) => {
      set(
        produce((draft: ZoomStore) => {
          draft.transform.k = zoom;
        })
      );
    },
    setTransform: (transform) => {
      set(
        produce((draft: ZoomStore) => {
          draft.transform = transform;
        })
      );
    },
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
