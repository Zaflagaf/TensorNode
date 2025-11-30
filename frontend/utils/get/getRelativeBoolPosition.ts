import { useZoomStore } from "@/frontend/store/zoomStore";

export default function getRelativeBoolPosition(
  domPos: { x: number; y: number },
  canvasRect: DOMRect
): boolean {
  if (!domPos || !canvasRect) return false;

  const transform = useZoomStore.getState().transform;

  const insideX =
    domPos.x >= canvasRect.left + transform.x &&
    domPos.x <= canvasRect.right + transform.x;
  const insideY =
    domPos.y >= canvasRect.top + transform.y &&
    domPos.y <= canvasRect.bottom + transform.y;

  return insideX && insideY;
}
