import { useZoomStore } from "@/frontend/store/zoomStore";

/**
 * Transforme des coordonnées locales du workflow en position DOM
 * relative au canvas, en prenant en compte le zoom / pan (transform.k, transform.x, transform.y)
 */
export default function getDOMPosition(localPos: { x: number; y: number }, canvasRect: DOMRect) {
  if (!localPos || !canvasRect) return null;

  const transform = useZoomStore.getState().transform;


  // Applique le zoom/pan
  const x = localPos.x * transform.k + transform.x + canvasRect.left;
  const y = localPos.y * transform.k + transform.y + canvasRect.top;

  return { x, y };
}
