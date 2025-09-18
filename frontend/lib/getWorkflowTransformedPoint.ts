"use client";
import { RefObject } from "react";

type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

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
  zoom: number,
  transform: { x: number; y: number }
): Point | null {

  const scale = zoom;
  const canvasRect = workflow.getBoundingClientRect();

  const x =
    (box.left - canvasRect.left + box.width / 2 - transform.x) / scale;
  const y =
    (box.top - canvasRect.top + box.height / 2 - transform.y) / scale;

  return { x, y };
}