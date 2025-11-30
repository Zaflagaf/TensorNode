"use client";

import { cn } from "@/frontend/lib/utils";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { useTrainingStore } from "@/frontend/store/trainingStore";
import { TimelineProps } from "@/frontend/types";
import { useShallow } from "zustand/shallow";
import useTimelineStore from "../../../../../store/panels-store/timeline-store";
import TimelineCursor from "./Cursor";
import { GraphAtTick } from "./GraphAtTick";

interface Graph {
  name: string;
  visibility: boolean;
  color: number;
  points: { x: number; y: number }[];
}

function transformHistoryToGraphs(
  history: Record<string, number[]>
): Graph[] {
  const graphs: Graph[] = [];
  let colorCounter = 0;

  for (const metricName in history) {
    const values = history[metricName];

    if (!Array.isArray(values)) {
      console.warn(`Expected array for ${metricName}`, values);
      continue;
    }

    const points = values.map((y, i) => ({ x: i, y }));

    graphs.push({
      name: metricName,
      visibility: true,
      color: colorCounter++,
      points,
    });
  }

  return graphs;
}

export function Timeline({
  graphs,
  onPositionChange,
  scrollLeft = 0,
  onScrollChange,
}: TimelineProps) {
  const {
    ticks,
    visibleTicks,
    horizontalTicks,
    tickWidth,
    minY,
    maxY,
    timelineStart,
    timelineEnd,
  } = useTimelineStore(
    useShallow((state) => ({
      ticks: state.ticks,
      visibleTicks: state.visibleTicks,
      horizontalTicks: state.horizontalTicks,
      tickWidth: state.tickWidth,
      minY: state.minY,
      maxY: state.maxY,
      timelineStart: state.timelineStart,
      timelineEnd: state.timelineEnd,
    }))
  );
  const history = useTrainingStore((state) => state.history);
  const totalEpochs = useTrainingStore((state) => state.totalEpochs);

  useEffect(() => {
    const graphsProperties = transformHistoryToGraphs(history);
    useTimelineStore.setState({ graphs: graphsProperties });
  }, [history]);

  useEffect(() => {
    useTimelineStore.setState({ timelineEnd: totalEpochs });
  }, [totalEpochs]);

  const containerRef = useRef<HTMLDivElement>(null);
  const zeroPercent = minY === maxY ? 50 : ((0 - minY) / (maxY - minY)) * 100;

  const visibleTicksMap = useMemo(() => {
    const centerTick = scrollLeft / tickWidth;
    const start = Math.floor(centerTick) - 30;
    return Array.from({ length: visibleTicks + 51 }, (_, i) => i + start);
  }, [scrollLeft]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) onScrollChange?.(containerRef.current.scrollLeft);
  }, [onScrollChange]);

  useEffect(() => {
    if (containerRef.current) {
      const centerScroll = 5000 * tickWidth;
      containerRef.current.scrollLeft = centerScroll;
      onScrollChange?.(centerScroll);
    }
  }, [onScrollChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY * 2;
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div className="w-full h-full">
      {Array.from({ length: horizontalTicks + 1 }).map((_, i) => {
        const bottomPercent = (i / horizontalTicks) * 100;
        const yValue =
          minY === maxY
            ? -10 + (i / horizontalTicks) * 20
            : minY + (i / horizontalTicks) * (maxY - minY);

        return (
          <div
            key={i}
            className="bg-border/50 z-1 left-0 absolute w-full h-px"
            style={{ bottom: `${bottomPercent}%` }}
          >
            <span className="left-2 absolute top-0 !font-mono text-xxs">
              {yValue.toFixed(1)}
            </span>
          </div>
        );
      })}
      <div
        className="bg-foreground/25 z-1 left-0 absolute w-full h-px text-xxs !font-mono justify-end flex"
        style={{ bottom: `${zeroPercent}%` }}
      >
        Target [0]
      </div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-x-auto overflow-y-hidden bg-card border-b border-border scroll-smooth snap-mandatory relative"
      >
        <div
          style={{
            width: ticks * tickWidth,
            height: "100%",
            position: "relative",
          }}
        >
          {graphs.map(
            (graph, key) =>
              graph.visibility && (
                <GraphAtTick key={key} tick={ticks / 2} graph={graph} />
              )
          )}

          <TimelineCursor />
          {visibleTicksMap.map((tick) => {
            const offsetTick = tick - ticks / 2;
            return (
              <div
                key={offsetTick}
                style={{ left: tick * tickWidth, width: tickWidth }}
                className={cn(
                  "absolute top-0 h-full border-l border-border/50 cursor-pointer group transition-colors flex flex-col items-start",
                  (offsetTick < timelineStart || offsetTick + 1 >= timelineEnd) && "bg-background/50"
                )}
                onClick={() => onPositionChange?.(offsetTick * tickWidth)}
              >
                {offsetTick % 10 === 0 ? (
                  <>
                    <div className="w-px h-2 bg-foreground/60 mt-0 snap-start" />
                    <span className="text-xxs text-muted-foreground mt-0 !font-mono -translate-x-1/2 relative">
                      {offsetTick}
                    </span>
                  </>
                ) : (
                  <div className="w-px h-1 bg-foreground/30 mt-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
