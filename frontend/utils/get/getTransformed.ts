import { useZoomStore } from "@/frontend/store/zoomStore";

/**
 * Transforme la position d'un élément DOM en coordonnées locales du workflow
 * en prenant en compte le zoom / pan (transform.k, transform.x, transform.y)
 */
export default function getTransformed(element: Element, canvas: Element) {
  if (!element || !canvas) return null;

  const transform = useZoomStore.getState().transform;

  const rect = element.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();

  // Coordonnées relatives au canvas
  const x = rect.left + rect.width / 2 - canvasRect.left;
  const y = rect.top + rect.height / 2 - canvasRect.top;

  // Applique le transform inverse pour avoir les coordonnées locales
  return {
    x: (x - transform.x) / transform.k,
    y: (y - transform.y) / transform.k,
  };
}
