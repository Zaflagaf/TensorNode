"use client";
import { useEffect, useState } from "react";
import { useWorkflowStore } from "../store/workflowStore";
import { useZoomStore } from "../store/zoomStore";

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
  const zoomRef = useZoomStore((state) => state.zoomRef);
  const transformRef = useZoomStore((state) => state.transformRef);

  const [transformedPoint, setTransformedPoint] = useState<Point | null>(null);

  useEffect(() => {
    if (!workflowRef.current || !zoomRef.current || !transformRef.current) return;

    const scale = zoomRef.current;
    const canvasRect = workflowRef.current.getBoundingClientRect();

    const x =
      (box.left - canvasRect.left + box.width / 2 - transformRef.current.x) / scale;
    const y =
      (box.top - canvasRect.top + box.height / 2 - transformRef.current.y) / scale;

    setTransformedPoint({ x, y });
  }, [box, workflowRef, zoomRef, transformRef]);

  return transformedPoint;
};
