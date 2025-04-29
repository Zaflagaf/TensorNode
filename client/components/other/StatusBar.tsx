"use client";
import { useFlowContext } from "@/context/FlowContext";
import { useZoom } from "@/context/ZoomContext";
import React, { useCallback, useEffect, useState } from "react";

export default function StatusBar() {
    const { nodes, edges } = useFlowContext();
    const { projectPosition, zoom } = useZoom();
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        const position = projectPosition({
          x: e.clientX,
          y: e.clientY,
        });
        if (!position) return;
        setCursorPosition({ x: position.x, y: position.y });
      },
      [zoom, projectPosition]
    );

    useEffect(() => {
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }, [handleMouseMove]);

    return (
      <div className="w-full h-10 px-6 border-t border-gray-300 bg-white flex items-center justify-between text-xs text-gray-700">
        <div className="flex items-center gap-8">
          <span className="text-gray-500">
            Zoom: <span className="text-gray-800">{zoom.toFixed(1)}x</span>
          </span>
          <span className="text-gray-500">
            Nodes: <span className="text-gray-800">{Object.keys(nodes).length}</span>
          </span>
          <span className="text-gray-500">
            Edges: <span className="text-gray-800">{edges.length}</span>
          </span>
          <span className="text-gray-500">
            Cursor:{" "}
            <span className="text-gray-800">
              X:{cursorPosition.x.toFixed(0)} Y:{cursorPosition.y.toFixed(0)}
            </span>
          </span>
        </div>
        <div className="text-gray-700">
          <strong className="font-semibold">Untitled Flow</strong> -{" "}
          <span className="text-red-500">Unsaved</span>
        </div>
      </div>
    );
}
