"use client";

import { motion } from "framer-motion";
import "katex/dist/katex.min.css";
import React, { useEffect, useRef, useState } from "react";
import WorkflowSubGrid from "./sublayouts/Grid";

const Latex = require("react-latex");

// (fonctions d'activation)

import { Info } from "lucide-react";

import { ACTIVATIONS_FUNCTION } from "@/frontend/config/data/functions";

const generateFunctionData = (
  func: (x: number) => number,
  start = -5,
  end = 5,
  steps = 200
) => {
  const data = [];
  const stepSize = (end - start) / steps;
  for (let i = 0; i <= steps; i++) {
    const x = start + i * stepSize;
    const y = func(x);
    data.push({ x, y });
  }
  return data;
};

const WorkflowChart = React.memo(
  ({
    functionType = "sigmoid",
  }: {
    functionType?: "sigmoid" | "tanh" | "relu" | any;
  }) => {
    // fonction active
    const func = ACTIVATIONS_FUNCTION[functionType].func;

    const chartData = generateFunctionData(func, -5, 5);

    const xValues = chartData.map((p) => p.x);
    const yValues = chartData.map((p) => p.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [tooltip, setTooltip] = useState<{
      px: number;
      py: number;
      value: { x: number; y: number };
    } | null>(null);

    useEffect(() => {
      const updateSize = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setSize({ width: rect.width, height: rect.height });
        }
      };

      updateSize();

      const resizeObserver = new ResizeObserver(() => {
        updateSize();
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    const getSvgCoords = (x: number, y: number) => {
      const px = ((x - minX) / (maxX - minX)) * size.width;
      const py = size.height - ((y - minY) / (maxY - minY)) * size.height;
      return { px, py };
    };

    const getFuncValueFromMouse = (event: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || size.width === 0 || size.height === 0) return null;

      const rect = svgRef.current.getBoundingClientRect();

      // Direct pixel coordinates relative to SVG
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;

      // Clamp to SVG bounds
      const clampedX = Math.max(0, Math.min(relativeX, rect.width));

      // Convert pixel to value X (using actual rendered width)
      const xVal = minX + (clampedX / rect.width) * (maxX - minX);
      const yVal = func(xVal);

      const { px, py } = getSvgCoords(xVal, yVal);
      return { px, py, value: { x: xVal, y: yVal } };
    };

    const pathData = chartData
      .map((p, i) => {
        const { px, py } = getSvgCoords(p.x, p.y);
        return `${i === 0 ? "M" : "L"} ${px} ${py}`;
      })
      .join(" ");

    return (
      <div
        ref={containerRef}
        className="relative z-0 w-full h-[200px] my-2 rounded-[4px]"
      >
        <WorkflowSubGrid>
          {/* Label */}

          <div className="absolute flex items-center gap-1 px-2 py-1 text-xs rounded z-1 top-2 left-2 text-node-text">
            <div className="relative group">
              <Info
                size="icon"
                className="cursor-pointer pointer-events-auto text-node-text size-3"
              />
              {/* Tooltip animé avec position fixe */}
              <div className="absolute max-w-xs p-2 transition-all duration-200 ease-out translate-y-2 border rounded shadow-lg opacity-0 pointer-events-none text-[7px] top-5 w-max border-node-outline bg-node-from-gradient group-hover:opacity-100 group-hover:translate-y-0">
                <Latex>{ACTIVATIONS_FUNCTION[functionType].equation}</Latex>
              </div>
            </div>
            <p className="pb-[2px] h-fit">{functionType}(x)</p>
          </div>

          <svg
            ref={svgRef}
            width={size.width || 300}
            height={size.height || 300}
            className="absolute inset-0"
            onMouseMove={(e) => {
              const pos = getFuncValueFromMouse(e);
              setTooltip(pos);
            }}
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

            {/* Fonction */}
            <motion.path
              key={functionType}
              d={pathData}
              fill="none"
              stroke="var(--color-node-vz-muted)"
              strokeWidth={2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
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
              className="absolute text-xs pointer-events-none text-foreground bg-card p-1 rounded-xs border border-border whitespace-nowrap"
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
