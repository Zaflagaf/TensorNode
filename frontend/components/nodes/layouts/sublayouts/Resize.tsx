import { cn } from "@/frontend/lib/utils";
import React, { useRef, useState } from "react";

type Direction =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

const ResizeHandle = ({
  direction,
  onResize,
}: {
  direction: Direction;
  onResize: (deltaX: number, deltaY: number) => void;
}) => {
  const start = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    start.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (e: MouseEvent) => {
      if (start.current) {
        const deltaX = e.clientX - start.current.x;
        const deltaY = e.clientY - start.current.y;
        start.current = { x: e.clientX, y: e.clientY };
        onResize(deltaX, deltaY);
      }
    };

    const handleMouseUp = () => {
      start.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // styles et curseurs en fonction de la direction
  const base = "absolute bg-transparent z-50";
  const styles: Record<Direction, string> = {
    top: `top-0 left-0 w-full h-2 cursor-n-resize`,
    bottom: `bottom-0 left-0 w-full h-2 cursor-s-resize`,
    left: `top-0 left-0 h-full w-2 cursor-w-resize`,
    right: `top-0 right-0 h-full w-2 cursor-e-resize`,
    "top-left": `top-0 left-0 w-3 h-3 cursor-nw-resize`,
    "top-right": `top-0 right-0 w-3 h-3 cursor-ne-resize`,
    "bottom-left": `bottom-0 left-0 w-3 h-3 cursor-sw-resize`,
    "bottom-right": `bottom-0 right-0 w-3 h-3 cursor-se-resize`,
  };

  return (
    <div
      className={`${base} ${styles[direction]} transform-freeze-all`}
      onMouseDown={handleMouseDown}
    />
  );
};

const WorkflowSubResize = ({ children }: { children: React.ReactNode }) => {
  const [size, setSize] = useState({ width: 300, height: 200 });

  const handleResize = (direction: Direction) => (dx: number, dy: number) => {
    setSize((prev) => {
      let { width, height } = prev;

      switch (direction) {
        case "right":
          width = Math.max(50, width + dx);
          break;
        case "left":
          width = Math.max(50, width - dx);
          break;
        case "bottom":
          height = Math.max(50, height + dy);
          break;
        case "top":
          height = Math.max(50, height - dy);
          break;
        case "bottom-right":
          width = Math.max(50, width + dx);
          height = Math.max(50, height + dy);
          break;
        case "bottom-left":
          width = Math.max(50, width - dx);
          height = Math.max(50, height + dy);
          break;
        case "top-right":
          width = Math.max(50, width + dx);
          height = Math.max(50, height - dy);
          break;
        case "top-left":
          width = Math.max(50, width - dx);
          height = Math.max(50, height - dy);
          break;
      }

      return { width, height };
    });
  };

  return (
    <div
      className={cn("relative")}
      style={{ width: size.width, height: size.height }}
    >
      {/* zone scrollable */}
      <div className="w-full h-full overflow-y-scroll">{children}</div>

      {/* resize handles */}
      {(
        [
          "top",
          "right",
          "bottom",
          "left",
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
        ] as Direction[]
      ).map((dir) => (
        <ResizeHandle key={dir} direction={dir} onResize={handleResize(dir)} />
      ))}
    </div>
  );
};

export default WorkflowSubResize;
