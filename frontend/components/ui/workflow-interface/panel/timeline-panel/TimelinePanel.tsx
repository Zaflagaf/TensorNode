"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/frontend/components/ui/shadcn/popover";
import { cn } from "@/frontend/lib/utils";
import { WorkflowTimelinePanelProps } from "@/frontend/types";
import { Eye, EyeClosed, GripVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import useTimelineStore from "../../../../../store/panels-store/timeline-store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../../shadcn/resizable";
import { Timeline } from "./Timeline";

interface ColorPickerProps {
  value: number;
  onChange: (colorNumber: number) => void;
  totalColors?: number;
}

export function ColorPicker({
  value,
  onChange,
  totalColors = 36,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const colors = Array.from(
    { length: totalColors },
    (_, i) => i * Math.round(360 / totalColors)
  );

  const handleColorSelect = (colorNumber: number) => {
    onChange(colorNumber);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-3 h-3 rounded-xs transition-all hover:brightness-150 border border-border cursor-pointer"
          )}
          style={{
            backgroundColor: `var(--color-hue-${value})`,
          }}
          title={`Click to change color (currently ${value}°)`}
          aria-label={`Color picker, currently ${value}°`}
        />
      </PopoverTrigger>
      <PopoverContent className="w-fit p-1.5 rounded-xs" align="end">
        <div className="grid grid-cols-9 gap-1">
          {colors.map((colorNumber) => (
            <button
              key={colorNumber}
              onClick={() => handleColorSelect(colorNumber)}
              className={cn(
                "w-4 h-4 rounded-xs transition-all hover:brightness-110 border",
                value === colorNumber
                  ? "border-foreground ring-1 ring-foreground"
                  : "border-border"
              )}
              style={{
                backgroundColor: `var(--color-hue-${colorNumber})`,
              }}
              title={`Color ${colorNumber}°`}
              aria-label={`Color ${colorNumber}`}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TimelineList() {
  const graphs = useTimelineStore((state) => state.graphs);

  const handleColorChange = (newColor: number, name: string) => {
    useTimelineStore.setState((state) => {
      const updatedGraphs = state.graphs.map((graph) =>
        graph.name === name ? { ...graph, color: newColor } : graph
      );
      return { graphs: updatedGraphs };
    });
  };

  return (
    <div>
      {graphs.map((graphProp, key) => {
        return (
          <div
            key={key}
            className="text-xxs flex items-center justify-between bg-accent py-1 rounded-xs m-1"
          >
            <div className="flex pl-1.5 gap-1.5 items-center justify-center">
              <ColorPicker
                value={graphProp.color}
                onChange={(color) => handleColorChange(color, graphProp.name)}
              />
              {graphProp.name}
            </div>
            <div
              className="cursor-pointer pr-0.5 flex gap-1"
              onClick={() =>
                useTimelineStore.setState((state) => {
                  const updatedGraphs = state.graphs.map((item, i) =>
                    i === key ? { ...item, visibility: !item.visibility } : item
                  );
                  return { graphs: updatedGraphs };
                })
              }
            >
              {graphProp.visibility ? (
                <Eye className="size-3" />
              ) : (
                <EyeClosed className="size-3 stroke-muted-foreground" />
              )}
              <GripVertical className="size-3" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function WorkflowTimelinePanel({
  onSeek,
}: WorkflowTimelinePanelProps) {
  const graphs = useTimelineStore((state) => state.graphs);
  const [scrollLeft, setScrollLeft] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allPoints = graphs.flatMap((g) => g.points);

    if (allPoints.length === 0) return;

    const rawMinY = Math.min(...allPoints.map((p) => p.y));
    const rawMaxY = Math.max(...allPoints.map((p) => p.y));

    const paddingPercent = 5;
    const padding = (rawMaxY - rawMinY) * (paddingPercent / 100);

    const minY = rawMinY - padding;
    const maxY = rawMaxY + padding;

    useTimelineStore.setState({
      containerRef,
      minY,
      maxY,
      graphs,
    });
  }, [graphs]);

  const handleCursorChange = useCallback(
    (newPosition: number) => {
      onSeek?.(newPosition);

      if (!timelineRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = newPosition - scrollLeft;
      if (cursorX < rect.width * 0.2)
        timelineRef.current.scrollLeft = Math.max(
          0,
          newPosition - rect.width * 0.5
        );
      else if (cursorX > rect.width * 0.8)
        timelineRef.current.scrollLeft = newPosition - rect.width * 0.5;
    },
    [scrollLeft, onSeek]
  );

  return (
    <div ref={containerRef} className="w-full h-full flex">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel minSize={5} defaultSize={15}>
          <TimelineList />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel minSize={30}>
          <div className="w-full h-full relative overflow-hidden">
            <div ref={timelineRef} className="absolute inset-0">
              <Timeline
                graphs={graphs}
                onPositionChange={handleCursorChange}
                scrollLeft={scrollLeft}
                onScrollChange={setScrollLeft}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
