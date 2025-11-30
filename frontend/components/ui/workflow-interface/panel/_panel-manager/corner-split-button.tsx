"use client";

import { cn, invertPair } from "@/frontend/lib/utils";
import React, { memo, useEffect, useRef, useState } from "react";

interface CornerSplitButtonProps {
  cornerY: "top" | "bottom";
  cornerX: "left" | "right";
  onSplit: (
    direction: "horizontal" | "vertical",
    size: number,
    cy: "top" | "bottom",
    cx: "right" | "left"
  ) => void;
}

export const CornerSplitButton = memo(
  ({ cornerY, cornerX, onSplit }: CornerSplitButtonProps) => {
    const clickedButtonRef = useRef<HTMLButtonElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [direction, setDirection] = useState<"horizontal" | "vertical">(
      "horizontal"
    );
    const [size, setSize] = useState(50);
    const [isCtrlKey, setIsCtrlKey] = useState<boolean>(false);

    const calculateSize = (
      e: MouseEvent | React.MouseEvent<HTMLButtonElement>
    ) => {
      const buttonRect = clickedButtonRef.current?.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!buttonRect || !containerRect) return;

      let originX = cornerX === "left" ? buttonRect.left : buttonRect.right;
      let originY = cornerY === "top" ? buttonRect.top : buttonRect.bottom;

      const deltaX = e.clientX - originX;
      const deltaY = e.clientY - originY;

      const isVertical = Math.abs(deltaX) > Math.abs(deltaY);
      const newDirection = isVertical ? "horizontal" : "vertical";

      setDirection(newDirection);

      const percentSize =
        ((isVertical ? Math.abs(deltaX) : Math.abs(deltaY)) /
          (isVertical ? containerRect.width : containerRect.height)) *
        100;

      setSize(Math.max(5, Math.min(95, percentSize)));
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isCtrlKey) return;

      clickedButtonRef.current = e.currentTarget;
      setIsDragging(true);
      setShowPreview(true);
      calculateSize(e);

      const handleMove = (e: MouseEvent) => calculateSize(e);

      document.addEventListener("mousemove", handleMove);
      document.addEventListener(
        "mouseup",
        () => {
          onSplit(direction, size, cornerY, cornerX);
          setIsDragging(false);
          setShowPreview(false);
          document.removeEventListener("mousemove", handleMove);
        },
        { once: true }
      );
    };
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Control") setIsCtrlKey(true);
      };
      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === "Control") setIsCtrlKey(false);
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, []);
    useEffect(() => {
      document.body.style.cursor = isDragging || showPreview ? "crosshair" : "";
    }, [isDragging, showPreview]);

    const gap = 6;
    const previewStyle: Record<string, React.CSSProperties> = {
      A:
        direction === "horizontal"
          ? {
              width: `calc(${size}% - ${gap / 2}px)`,
              height: "100%",
              [cornerX]: 0,
              [cornerY]: 0,
            }
          : {
              height: `calc(${size}% - ${gap / 2}px)`,
              width: "100%",
              [cornerX]: 0,
              [cornerY]: 0,
            },
      B:
        direction === "horizontal"
          ? {
              width: `calc(${100 - size}% - ${gap / 2}px )`,
              height: "100%",
              [invertPair(cornerX, ["left", "right"])]: 0,
              [invertPair(cornerY, ["top", "bottom"])]: 0,
            }
          : {
              height: `calc(${100 - size}% - ${gap / 2}px )`,
              width: "100%",
              [invertPair(cornerX, ["left", "right"])]: 0,
              [invertPair(cornerY, ["top", "bottom"])]: 0,
            },
    };

    return (
      <div ref={containerRef} className="absolute inset-0 pointer-events-none">
        <button
          onMouseDown={handleMouseDown}
          className={cn(
            `absolute ${cornerX}-0 ${cornerY}-0 w-3 h-3 pointer-events-auto
           `,
            isCtrlKey && "hover:cursor-crosshair"
          )}
        />

        {showPreview && (
          <>
            <div
              className="absolute z-10 bg-foreground/25 outline outline-foreground -outline-offset-1 pointer-events-none rounded-[5px]"
              style={previewStyle.A}
            />
            <div
              className="absolute z-10 bg-foreground/25 outline outline-foreground -outline-offset-1 pointer-events-none rounded-[5px]"
              style={previewStyle.B}
            />
          </>
        )}
      </div>
    );
  }
);
