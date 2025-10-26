"use client";
import { Position, Box} from "@/frontend/types"


/**
 * Transforme une boîte DOM en coordonnées de workflow
 * @param box - boîte à transformer
 * @param workflowRef - ref vers le container workflow
 * @param zoomRef - ref vers le facteur de zoom
 * @param transformRef - ref vers la translation du canvas
 * @returns Point transformé ou null si refs non prêts
 */
export function getWorkflowTransformedPoint(
  box: Box,
  workflow: HTMLElement,
  transform: { x: number; y: number, k: number }
): Position | null {

  const scale = transform.k;
  const canvasRect = workflow.getBoundingClientRect();

  const x =
    (box.left - canvasRect.left + box.width / 2 - transform.x) / scale;
  const y =
    (box.top - canvasRect.top + box.height / 2 - transform.y) / scale;

  return { x, y };
}