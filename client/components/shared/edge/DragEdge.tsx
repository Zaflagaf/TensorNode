"use client";
import { useFlowContext } from "@/context/FlowContext";
import { useZoom } from "@/context/ZoomContext";
import { useCallback, useEffect, useRef, useState } from "react";
import "./edge.scss";

const TYPE_COLORS = {
  layer: "#FFCA3A",
  model: "#FF595E",
  data: "#1982C4",
  features: "#1982C4",
  labels: "#1982C4",
  default: "#6b7280", // gray
} as const;

type TypeKey = keyof typeof TYPE_COLORS;

export default function DragEdgeComponent({
  id,
  sourceHandle,
}: {
  id: string;
  sourceHandle: HTMLDivElement | null;
}) {
  const { zoom } = useZoom();
  const { setDragEdge, addEdge, canvasRef } = useFlowContext();

  const [endPath, setEndPath] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [startPath, setStartPath] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const edgeRef = useRef<SVGPathElement | null>(null);
  const dateRef = useRef<string>("");

  const [handleType, setHandleType] = useState<string | null>(null);

  useEffect(() => {
    const getHandleDataId = (handle: HTMLDivElement | null): string | null => {
      return handle?.getAttribute("data-id") ?? null;
    };

    setHandleType(getHandleDataId(sourceHandle));
  }, [sourceHandle]);

  const getColor = useCallback(
    (type: string | null): string => {
      const key = type as TypeKey;
      return TYPE_COLORS[key] || TYPE_COLORS.default;
    },
    [sourceHandle]
  );

  const fromColor = getColor(handleType);

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

        setEndPath({ x: startX, y: startY });
        setStartPath({ x: endX, y: endY });
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

      const newId = dateRef.current;
      addEdge(
        targetId,
        sourceId,
        sourceHandleId,
        targetHandleId,
        newId,
        sourceHandleType,
        targetHandleType
      );
    }
    setDragEdge(null);
  };

  return (
    <svg
      id={id}
      className="edge"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient id={`${id}-gradient`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={TYPE_COLORS.default} />
        </linearGradient>
      </defs>

      <path
        ref={edgeRef}
        d={`M ${startPath.x} ${startPath.y} C ${
          (startPath.x + endPath.x) / 2
        } ${startPath.y}, ${(startPath.x + endPath.x) / 2} ${endPath.y}, ${
          endPath.x
        } ${endPath.y}`}
        className="path-hitbox"
        style={{ pointerEvents: "none" }}
      />


      <path
        d={`M ${startPath.x} ${startPath.y} C ${
          (startPath.x + endPath.x) / 2
        } ${startPath.y}, ${(startPath.x + endPath.x) / 2} ${endPath.y}, ${
          endPath.x
        } ${endPath.y}`}
        className="stroke-2 dragedge-path"
        stroke={`url(#${id}-gradient)`}
      />
    </svg>
  );
}
