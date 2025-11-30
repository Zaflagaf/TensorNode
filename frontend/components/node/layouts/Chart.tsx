"use client";

import { ACTIVATIONS_FUNCTION } from "@/frontend/config/data/functions";
import { useZoomStore } from "@/frontend/store/zoomStore";
import { Activations } from "@/frontend/types/function";
import "katex/dist/katex.min.css";
import { ArrowRight, Info } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import WorkflowSubGrid from "./sublayouts/Grid";

const Latex = require("react-latex");

type Tooltip = {
  px: number;
  py: number;
  value: { x: number; y: number };
};

// Throttle util
function throttle<T extends (...args: any[]) => void>(fn: T, wait: number) {
  let lastTime = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn(...args);
    }
  };
}

// Génération des points pour la fonction
const generateFunctionData = (
  func: (x: number) => number,
  start = -5,
  end = 5,
  steps = 200
) => {
  const data: { x: number; y: number }[] = [];
  const stepSize = (end - start) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = start + i * stepSize;
    const y = func(x);
    data.push({ x, y });
  }
  return data;
};

interface WorkflowChartProps {
  functionType?: Activations;
}

const WorkflowChart: React.FC<WorkflowChartProps> = React.memo(
  ({ functionType = Activations.sigmoid }) => {
    const func = ACTIVATIONS_FUNCTION[functionType].func;

    const chartData = useMemo(() => generateFunctionData(func, -5, 5), [func]);

    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const transform = useZoomStore((state) => state.transform);

    const [size, setSize] = useState({ width: 0, height: 0 });
    const [tooltip, setTooltip] = useState<Tooltip | null>(null);

    const { minX, maxX, minY, maxY } = useMemo(() => {
      const xValues = chartData.map((p) => p.x);
      const yValues = chartData.map((p) => p.y);
      return {
        minX: Math.min(...xValues),
        maxX: Math.max(...xValues),
        minY: Math.min(...yValues),
        maxY: Math.max(...yValues),
      };
    }, [chartData]);

    useEffect(() => {
      const updateSize = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const newSize = {
          width: rect.width / transform.k,
          height: rect.height / transform.k,
        };
        setSize((prev) =>
          prev.width !== newSize.width || prev.height !== newSize.height
            ? newSize
            : prev
        );
      };

      updateSize();

      const resizeObserver = new ResizeObserver(updateSize);
      if (containerRef.current) resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    }, [transform.k]);

    const getSvgCoords = useCallback(
      (x: number, y: number) => {
        const px = ((x - minX) / (maxX - minX)) * size.width;
        const py = size.height - ((y - minY) / (maxY - minY)) * size.height;
        return { px, py };
      },
      [minX, maxX, minY, maxY, size]
    );

    const getFuncValueFromMouse = useCallback(
      (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current || size.width === 0 || size.height === 0)
          return null;

        const rect = svgRef.current.getBoundingClientRect();
        const relativeX = Math.max(
          0,
          Math.min(event.clientX - rect.left, rect.width)
        );
        const xVal = minX + (relativeX / rect.width) * (maxX - minX);
        const yVal = func(xVal);
        const { px, py } = getSvgCoords(xVal, yVal);
        return { px, py, value: { x: xVal, y: yVal } };
      },
      [func, getSvgCoords, minX, maxX, size]
    );

    const throttledMouseMove = useMemo(
      () =>
        throttle((e: React.MouseEvent<SVGSVGElement>) => {
          setTooltip(getFuncValueFromMouse(e));
        }, 16),
      [getFuncValueFromMouse]
    );

    const pathData = useMemo(
      () =>
        chartData
          .map((p, i) => {
            const { px, py } = getSvgCoords(p.x, p.y);
            return `${i === 0 ? "M" : "L"} ${px} ${py}`;
          })
          .join(" "),
      [chartData, getSvgCoords]
    );

    return (
      <div ref={containerRef} className="relative z-0 w-full h-[200px] ">
        <WorkflowSubGrid>
          <div className="absolute flex items-center gap-1 px-2 py-1 text-xs z-1 top-2 left-2 text-muted-foreground">
            <div className="relative group">
              <Info
                size="icon"
                className="cursor-pointer pointer-events-auto text-muted-foreground size-3"
              />
              <div className="absolute max-w-xs p-2 translate-y-2 border shadow-lg opacity-0 pointer-events-none text-xxs top-5 w-max border-border bg-background group-hover:opacity-100 group-hover:translate-y-0 rounded-xs">
                <Latex>{ACTIVATIONS_FUNCTION[functionType].equation}</Latex>
              </div>
            </div>
            <p className="pb-[2px] h-fit">{functionType}(x)</p>
          </div>

          <svg
            ref={svgRef}
            width={size.width}
            height={size.height}
            className="absolute inset-0 min-w-0 min-h-0"
            onMouseMove={throttledMouseMove}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Axes */}
            <line
              x1={getSvgCoords(0, 0).px}
              y1={0}
              x2={getSvgCoords(0, 0).px}
              y2={size.height}
              stroke="#333"
              strokeWidth={1}
            />
            <line
              x1={0}
              y1={getSvgCoords(0, 0).py}
              x2={size.width}
              y2={getSvgCoords(0, 0).py}
              stroke="#333"
              strokeWidth={1}
            />

            {/* Courbe SANS animation */}
            <path
              d={pathData}
              fill="none"
              stroke="var(--color-node-vz-muted)"
              strokeWidth={2}
            />

            {/* Ligne verticale + point */}
            {tooltip && (
              <>
                <line
                  x1={tooltip.px}
                  y1={0}
                  x2={tooltip.px}
                  y2={size.height}
                  stroke="var(--color-node-vz-activ)"
                  strokeDasharray="4"
                />
                <circle
                  cx={tooltip.px}
                  cy={tooltip.py}
                  r={4}
                  fill="var(--color-node-vz-activ)"
                  stroke="var(--color-node-vz-activ)"
                />
              </>
            )}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute text-xs pointer-events-none text-muted-foreground bg-background p-1 rounded-xs border border-border whitespace-nowrap"
              style={{
                left: Math.min(Math.max(tooltip.px + 9, 0), size.width),
                top: Math.min(Math.max(tooltip.py - 9, 0), size.height),
              }}
            >
              {functionType + "(x: " + tooltip.value.x.toFixed(2) + ")"} ={" "}
              {tooltip.value.y.toFixed(2)}
            </div>
          )}
        </WorkflowSubGrid>
      </div>
    );
  }
);

export default WorkflowChart;
