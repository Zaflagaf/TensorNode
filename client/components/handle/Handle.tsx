"use client";
import { useFlowContext } from "@/context/FlowContext";
import React, { useEffect, useRef, useState, useMemo } from "react";

export default function Handle({
  children,
  type,
  id,
  dataId,
}: {
  children: React.ReactNode;
  type: string;
  id: string;
  dataId: string;
}) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const [nodeId, setNodeId] = useState<string>("");
  const { setDragEdge, updateNode } = useFlowContext();

  const randomColor = useMemo(() => {
    const r = Math.floor(150 + Math.random() * 50); // entre 150 et 200
    const g = Math.floor(150 + Math.random() * 50);
    const b = Math.floor(150 + Math.random() * 50);
    return `rgb(${r}, ${g}, ${b})`;
  }, []);

  const handleSize = 12;
  const leftPosition =
    type === "target"
      ? `calc(0% - ${handleSize / 2}px)`
      : `calc(100% - ${handleSize / 2}px)`;

  useEffect(() => {
    if (!handleRef.current) return;

    nodeRef.current = handleRef.current.closest(".node") as HTMLDivElement;

    const dataIdAttribute = nodeRef.current?.getAttribute("data-id");

    if (dataIdAttribute) {
      setNodeId(dataIdAttribute);
    }
  }, []);

  const handleMouseDown = () => {
    if (handleRef.current) {
      setDragEdge(handleRef.current);
    }
  };

  return (
    <div className="flex w-full relative">
      <div
        className="absolute"
        style={{
          left: leftPosition,
          top: `calc(50% - ${handleSize / 2}px)`,
        }}
      >
        <div
          data-node-id={nodeId}
          data-type={type}
          id={id}
          data-id={dataId}
          ref={handleRef}
          className="handle undraggable"
          onMouseDown={handleMouseDown}
          style={{
            width: handleSize,
            height: handleSize,
            borderRadius: handleSize / 4,
            border: "solid 1px rgb(0, 0, 0)",
            backgroundColor: "rgb(255,255,255)",
          }}
        ></div>
      </div>
      <div
        className={`w-full flex items-center px-[20px] py-[15px] ${
          type === "source" ? "justify-end" : "justify-start"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
