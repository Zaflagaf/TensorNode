import { useTrainingStore } from "@/frontend/store/trainingStore";
import React, { useEffect, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import useTimelineStore from "../../../../../store/panels-store/timeline-store";

export function TimelineTooltip() {
  const { containerRef, graphs, tickWidth, ticks, cursorPosition, minY, maxY } =
    useTimelineStore(
      useShallow((state) => ({
        containerRef: state.containerRef,
        graphs: state.graphs,
        cursorPosition: state.cursorPosition,
        ticks: state.ticks,
        tickWidth: state.tickWidth,
        minY: state.minY,
        maxY: state.maxY,
      }))
    );

  // À l'intérieur de Timeline, après le curseur draggable
  const intersections = useMemo(() => {
    if (!graphs) return undefined;

    return graphs.map((graph) => {
      // trouver le point proche du curseur
      const cursorTick = ticks / 2 + cursorPosition;
      // chercher les deux points entre lesquels le curseur se trouve
      const idx = graph.points.findIndex((p) => p.x >= cursorPosition);
      if (idx === -1) return null;
      if (idx === 0) return graph.points[0].y;
      const p1 = graph.points[idx - 1];
      const p2 = graph.points[idx];
      // interpolation linéaire
      const t = (cursorTick - ticks / 2 - p1.x) / (p2.x - p1.x);
      return p1.y + t * (p2.y - p1.y);
    });
  }, [graphs, cursorPosition]);

  return (
    intersections &&
    graphs &&
    containerRef?.current &&
    cursorPosition >= 0 &&
    graphs.map((graph, key) => {
      const yValue = intersections[key];
      if (yValue == null) return null;
      if (!graph.visibility) return null;

      const scaleY = (y: number) =>
        containerRef.current!.clientHeight -
        ((y - minY) / (maxY - minY)) * containerRef.current!.clientHeight;

      const circleX = (ticks / 2 + cursorPosition) * tickWidth;
      const circleY = scaleY(yValue);

      return (
        <React.Fragment key={key}>
          {/* Cercle au point d'intersection */}
          <svg
            className="absolute z-1 overflow-visible w-fit h-full pointer-events-none"
            style={{ left: circleX }}
          >
            <circle
              cx={0}
              cy={circleY ?? 0}
              r={4}
              fill="var(--color-hue-20)"
            />
          </svg>

          {/* Tooltip juste à côté du cercle */}
          <div
            className="absolute bg-sidebar z-1 border border-border text-xxs p-1 rounded shadow-lg pointer-events-none !font-mono"
            style={{
              left: circleX + 10,
              top: circleY - 10, // centre verticalement le tooltip par rapport au cercle
            }}
          >
            [{graph.name}]: {yValue.toFixed(2)}
          </div>
        </React.Fragment>
      );
    })
  );
}

export default function TimelineCursor() {
  const { ticks, tickWidth, cursorPosition } = useTimelineStore(
    useShallow((state) => ({
      ticks: state.ticks,
      tickWidth: state.tickWidth,
      cursorPosition: state.cursorPosition,
    }))
  );
  const epoch = useTrainingStore((state) => state.epoch);

  useEffect(() => {
    useTimelineStore.setState({ cursorPosition: epoch === 0 ? epoch : epoch -1});
  }, [epoch]);

  return (
    <>
      <div
        style={{ left: (ticks / 2 + cursorPosition) * tickWidth, top: 0 }}
        className="absolute h-full z-1"
      >
        <span className="absolute top-0 -left-px w-[2px] h-full bg-hue-20" />
        <span
          className="absolute flex items-center justify-center top-0 left-0 w-fit p-1 h-[15px] text-xxs bg-hue-20 rounded-xs cursor-grab !font-mono"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startCursorX = cursorPosition;

            const onMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX;
              useTimelineStore.setState({
                cursorPosition: startCursorX + Math.round(deltaX / tickWidth),
              });
            };
            const onMouseUp = () => {
              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);
            };
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          }}
        >
          {cursorPosition}
        </span>
      </div>
      <TimelineTooltip />
    </>
  );
}

