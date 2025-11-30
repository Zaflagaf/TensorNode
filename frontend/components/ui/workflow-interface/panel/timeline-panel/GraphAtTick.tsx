"use client";
import { GraphAtTickProps } from "@/frontend/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import useTimelineStore from "../../../../../store/panels-store/timeline-store";

export function GraphAtTick({ tick, graph }: GraphAtTickProps) {
  const containerRef = useRef<SVGSVGElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  const { tickWidth, minY, maxY } = useTimelineStore(
    useShallow((state) => ({
      tickWidth: state.tickWidth,
      minY: state.minY,
      maxY: state.maxY,
    }))
  );

  // Observer pour détecter les changements de taille
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (containerRef.current)
        setContainerHeight(containerRef.current.clientHeight);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const scaleY = useCallback(
    (y: number) =>
      containerHeight - ((y - minY) / (maxY - minY || 1)) * containerHeight,
    [containerHeight, minY, maxY]
  );

  const minX = useMemo(() => {
    if (!graph.points.length) return 0;
    return Math.min(...graph.points.map((p) => p.x));
  }, [graph.points]);

  const left = useMemo(() => {
    if (!Number.isFinite(tickWidth)) return 0;
    if (!Number.isFinite(minX)) return 0;
    if (!Number.isFinite(tick)) return 0;

    return (tick + minX) * tickWidth;
  }, [tick, minX, tickWidth]);

  const path = graph.points
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${(p.x - minX) * tickWidth},${scaleY(p.y)}`
    )
    .join(" ");

  return (
    <svg
      ref={containerRef}
      className="w-fit h-full absolute z-1 pointer-events-none overflow-visible"
      style={{ left, height: "100%" }}
    >
      <path
        d={path}
        stroke={`var(--color-hue-${graph.color})`}
        strokeWidth={1}
        fill="none"
      />

    </svg>
  );
}
