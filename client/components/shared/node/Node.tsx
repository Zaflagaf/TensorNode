"use client";
import { useFlowContext } from "@/context/FlowContext";
import { useZoom } from "@/context/ZoomContext";
import React, { useCallback, useEffect, useRef } from "react";
import "./node.scss";

export default function Node({
  children,
  id,
  defaultPosition = { x: 0, y: 0 },
}: {
  children: React.ReactNode;
  id: string;
  defaultPosition?: { x: number; y: number };
}) {
  const { removeNode, activeNode, setNodePosition, nodeToFront, canvasRef } =
    useFlowContext();
  const { zoom } = useZoom();

  const isActiveRef = useRef<boolean>(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(defaultPosition);
  const pivotPointRef = useRef<{ x: number; y: number } | null>(null);
  const snap = useRef({ x: 50, y: 50 });
  const draggingRef = useRef(false);

  const updateTransform = (x: number, y: number, is_write: boolean) => {
    const snappedX = Math.round(x / snap.current.x) * snap.current.x;
    const snappedY = Math.round(y / snap.current.y) * snap.current.y;
    if (nodeRef.current) {
      nodeRef.current.style.transform = `translate(${snappedX}px, ${snappedY}px)`;
    }
    positionRef.current = { x: snappedX, y: snappedY };
    if (is_write) {
      setNodePosition(id, { x: snappedX, y: snappedY });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (
        !draggingRef.current ||
        !canvasRef.current ||
        !nodeRef.current ||
        !pivotPointRef.current
      )
        return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const nodeRect = nodeRef.current.getBoundingClientRect();

      const x =
        (e.clientX -
          canvasRect.left -
          pivotPointRef.current.x +
          nodeRect.width / 2 -
          canvasRect.width / 2) /
        zoom;
      const y =
        (e.clientY -
          canvasRect.top -
          pivotPointRef.current.y +
          nodeRect.height / 2 -
          canvasRect.height / 2) /
        zoom;

      updateTransform(x, y, false);
    },
    [canvasRef, zoom, id, setNodePosition]
  );

  const handleMouseUp = useCallback(() => {
    draggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    updateTransform(positionRef.current.x, positionRef.current.y, true);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      nodeToFront(id);
      if ((e.target as HTMLElement)?.closest(".undraggable")) return;

      const rect = nodeRef.current?.getBoundingClientRect();
      if (!rect) return;

      pivotPointRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      draggingRef.current = true;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove, handleMouseUp, id, nodeToFront]
  );

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && activeNode === id) {
        removeNode(id);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [activeNode, id, removeNode]);

  useEffect(() => {
    if (activeNode === id) {
      isActiveRef.current = true;
    } else {
      isActiveRef.current = false;
    }
  }, [activeNode]);

  return (
    <div
      ref={nodeRef}
      id={id}
      className="node draggable"
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        width: "fit-content",
        height: "fit-content",
        transform: `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`,
      }}
    >
      <div className="flex w-full px-2 py-1 text-muted-foreground undraggable">
        x: {positionRef.current.x} y: {positionRef.current.y}
      </div>
      <div
        className="bg-[rgba(255,255,255,0.5)] inner-node backdrop-blur-sm"
        style={{
          width: "fit-content",
          height: "fit-content",
          outline: isActiveRef.current
            ? "2px solid black"
            : "1px solid rgb(0,0,0)",
          cursor: isActiveRef.current
            ? "url('/cursor/grabbing.svg') 14 14, auto"
            : "url('/cursor/grab.svg') 14 14, auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
