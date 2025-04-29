"use client";
import { useFlowContext } from "@/context/FlowContext";
import { useZoom } from "@/context/ZoomContext";
import React, { useEffect, useState, useRef, useCallback } from "react";
import "./edge.scss";
import { Edge } from "../other/FlowType";

export default function DragEdgeComponent({
  id,
  sourceHandle,
}: {
  id: string;
  sourceHandle: HTMLDivElement | null;
}) {
  const { zoom } = useZoom();
  const { setDragEdge, setEdges, canvasRef } = useFlowContext();
  const [path, setPath] = useState<string>("");
  const edgeRef = useRef<SVGPathElement | null>(null);
  const dateRef = useRef<string>("");

  useEffect(() => {
    const date = new Date().toISOString();
    dateRef.current = date;

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const updatePath = () => {
        if (!sourceHandle || !canvasRef.current) return;

        const sourceChildBound = sourceHandle.getBoundingClientRect();
        const canvasBound = canvasRef.current.getBoundingClientRect();

        const startX =
          (sourceChildBound.x + sourceChildBound.width / 2 - canvasBound.left) /
          zoom;
        const startY =
          (sourceChildBound.y + sourceChildBound.height / 2 - canvasBound.top) /
          zoom;

        const endX = (e.clientX + -canvasBound.left) / zoom;
        const endY = (e.clientY + -canvasBound.top) / zoom;

        setPath(
          `M ${startX} ${startY} C ${(startX + endX) / 2} ${startY}, ${
            (startX + endX) / 2
          } ${endY}, ${endX} ${endY}`
        );
      };

      updatePath();
    },
    [zoom]
  );

  const handleMouseUp = (e: MouseEvent) => {
    const target = e.target as Element;

    if (!target || !sourceHandle) {
      setDragEdge(null);
      return;
    }

    if (target.classList.contains("handle")) {
      const sourceHandleId = sourceHandle.id;
      const sourceId = sourceHandle.getAttribute("data-node-id");
      const sourceHandleType = sourceHandle.getAttribute("data-type");

      const targetId = target.getAttribute("data-node-id");
      const targetHandleId = target.id;
      const targetHandleType = target.getAttribute("data-type");

      if (!sourceId || !targetId || !sourceHandleType || !targetHandleType) {
        setDragEdge(null);
        return;
      }

      setEdges((eds: Edge[]) => {
        const newId = dateRef.current;
        let from = "";
        let to = "";

        if (sourceHandleType == "source" && targetHandleType == "target") {
          from = sourceHandleId;
          to = targetHandleId;
        } else if (
          sourceHandleType == "target" &&
          targetHandleType == "source"
        ) {
          from = targetHandleId;
          to = sourceHandleId;
        } else if (
          (sourceHandleType == "source" && targetHandleType == "source") ||
          (sourceHandleType == "target" && targetHandleType == "target")
        ) {
          return eds;
        }

        return [
          ...eds,
          {
            id: `e${newId}`,
            source: sourceId,
            target: targetId,
            sourceHandle: sourceHandleId,
            targetHandle: targetHandleId,
          },
        ];
      });
    }
    setDragEdge(null);
  };

  return (
    <svg
      id={id}
      className="edge"
      data-id={id}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <path
        ref={edgeRef}
        d={path}
        className="path-hitbox"
        style={{ pointerEvents: "none" }}
      />
      <path
        d={path}
        className="dragedge-path"
        mask={`url(#${id}-mask)`}
        style={{ pointerEvents: "none" }}
      />
    </svg>
  );
}
