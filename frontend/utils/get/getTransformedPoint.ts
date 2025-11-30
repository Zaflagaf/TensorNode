"use client";
import { useZoomStore } from "@/frontend/store/zoomStore";
import { Position } from "@/frontend/types";

/**
 * Transforme une boîte DOM en coordonnées de workflow
 * @param box - boîte à transformer
 * @param canvas - ref vers le container workflow
 * @param zoomRef - ref vers le facteur de zoom
 * @param transformRef - ref vers la translation du canvas
 * @returns Point transformé ou null si refs non prêts
 */
export function getTransformedPoint(
  point: Position,
  canvas: HTMLElement
): Position {
  const { x, y, k } = useZoomStore.getState().transform;
  const canvasRect = canvas.getBoundingClientRect();

  const xTrans = (point.x - canvasRect.left - x) / k;
  const yTrans = (point.y - canvasRect.top - y) / k;

  return { x: xTrans, y: yTrans };
}
