"use client";
import { useEffect, useState } from "react";
import { useWorkflowStore } from "../organism/canvas/store/workflowStore";
import { useZoomStore } from "../organism/canvas/store/zoomStore";

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

export const useWorkflowTransform = (box: Box): Point | null => {
  const workflowRef = useWorkflowStore((state) => state.workflow);

  const transform = useZoomStore((state) => state.transform);

  const [transformedPoint, setTransformedPoint] = useState<Point | null>(null);

  useEffect(() => {
    if (!workflowRef.current || !transform) return;

    const scale = transform.k;
    const canvasRect = workflowRef.current.getBoundingClientRect();

    const x =
      (box.left - canvasRect.left + box.width / 2 - transform.x) / scale;
    const y = (box.top - canvasRect.top + box.height / 2 - transform.y) / scale;

    setTransformedPoint({ x, y });
  }, [box, workflowRef, transform]);

  return transformedPoint;
};
