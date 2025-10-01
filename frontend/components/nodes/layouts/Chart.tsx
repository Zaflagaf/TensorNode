"use client";

import { motion } from "framer-motion";
import "katex/dist/katex.min.css";
import React, { useEffect, useRef, useState } from "react";
import WorkflowSubGrid from "./sublayouts/Grid";

const Latex = require("react-latex");

// (fonctions d’activation)
import { Info } from "lucide-react";
import {
  elu,
  exponential,
  gelu,
  linear,
  mish,
  relu,
  selu,
  sigmoid,
  softmax,
  softplus,
  softsign,
  swish,
  tanh,
} from "../functions/functions";

const activationFunctions: {
  func: (x: number) => number;
  domainX: string;
  domainY: string;
  equation: string;
}[] = [
  {
    func: sigmoid,
    domainX: "[-∞; +∞]",
    domainY: "[0; 1]",
    equation: "\\(\\sigma(x) = \\frac{1}{1 + e^{-x}}\\)",
  },
  {
    func: tanh,
    domainX: "[-∞; +∞]",
    domainY: "[-1; 1]",
    equation: "\\(\\tanh(x) = \\frac{e^x - e^{-x}}{e^x + e^{-x}}\\)",
  },
  {
    func: relu,
    domainX: "[-∞; +∞]",
    domainY: "[0; +∞[",
    equation: "\\(\\text{ReLU}(x) = \\max(0, x)\\)",
  },
  {
    func: swish,
    domainX: "[-∞; +∞]",
    domainY: "[-0.278; +∞[",
    equation:
      "\\(\\text{Swish}(x) = x \\cdot \\sigma(x) = \\frac{x}{1 + e^{-x}}\\)",
  },
  {
    func: softmax,
    domainX: "[-∞; +∞] vecteur",
    domainY: "]0; 1[",
    equation: "\\(\\text{Softmax}(x_i) = \\frac{e^{x_i}}{\\sum_j e^{x_j}}\\)",
  },
  {
    func: gelu,
    domainX: "[-∞; +∞]",
    domainY: "[-∞; +∞]",
    equation:
      "\\(\\text{GELU}(x) = 0.5 x \\left(1 + \\tanh\\left[\\sqrt{2/\\pi} (x + 0.044715 x^3)\\right]\\right)\\)",
  },
  {
    func: softplus,
    domainX: "[-∞; +∞]",
    domainY: "[0; +∞[",
    equation: "\\(\\text{Softplus}(x) = \\ln(1 + e^x)\\)",
  },
  {
    func: selu,
    domainX: "[-∞; +∞]",
    domainY: "[-1.76; +∞[",
    equation:
      "\\(\\text{SELU}(x) = \\lambda \\begin{cases} x & x > 0 \\\\ \\alpha(e^x - 1) & x \\le 0 \\end{cases}\\)",
  },
  {
    func: elu,
    domainX: "[-∞; +∞]",
    domainY: "]-1; +∞[",
    equation:
      "\\(\\text{ELU}(x) = \\begin{cases} x & x \\ge 0 \\\\ e^x - 1 & x < 0 \\end{cases}\\)",
  },
  {
    func: mish,
    domainX: "[-∞; +∞]",
    domainY: "[-0.31; +∞[",
    equation: "\\(\\text{Mish}(x) = x \\cdot \\tanh(\\ln(1 + e^x))\\)",
  },
  {
    func: softsign,
    domainX: "[-∞; +∞]",
    domainY: "]-1; 1[",
    equation: "\\(\\text{Softsign}(x) = \\frac{x}{1 + |x|}\\)",
  },
  {
    func: linear,
    domainX: "[-∞; +∞]",
    domainY: "[-∞; +∞]",
    equation: "\\(\\text{Linear}(x) = x\\)",
  },
  {
    func: exponential,
    domainX: "[-∞; +∞]",
    domainY: "]0; +∞[",
    equation: "\\(\\exp(x) = e^x\\)",
  },
];

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
    const func = (() => {
      switch (functionType) {
        case "sigmoid":
          return sigmoid;
        case "tanh":
          return tanh;
        case "relu":
          return relu;
        case "swish":
          return swish;
        case "softmax":
          return (x: number) => softmax(x); // note: softmax normalement sur un vecteur
        case "gelu":
          return gelu;
        case "softplus":
          return softplus;
        case "selu":
          return selu;
        case "elu":
          return elu;
        case "mish":
          return mish;
        case "softsign":
          return softsign;
        case "linear":
          return linear;
        case "exponential":
          return exponential;
        default:
          return sigmoid;
      }
    })();

    const chartData = generateFunctionData(func, -5, 5);

    const xValues = chartData.map((p) => p.x);
    const yValues = chartData.map((p) => p.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const containerRef = useRef<HTMLDivElement>(null);
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
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }, []);

    const getSvgCoords = (x: number, y: number) => {
      const px = ((x - minX) / (maxX - minX)) * size.width;
      const py = size.height - ((y - minY) / (maxY - minY)) * size.height;
      return { px, py };
    };

    const getFuncValueFromMouse = (event: React.MouseEvent<SVGSVGElement>) => {
      if (!containerRef.current) return null;

      const rect = containerRef.current.getBoundingClientRect();

      // Position brute de la souris dans la page
      const clientX = event.clientX;
      const clientY = event.clientY;

      // ⚠️ Correction du scale (zoom appliqué sur le container)
      const scaleX = rect.width / size.width;
      const scaleY = rect.height / size.height;

      // Coordonnées relatives corrigées
      const relativeX = (clientX - rect.left) / scaleX;
      // const relativeY = (clientY - rect.top) / scaleY; // si besoin plus tard

      // Conversion pixel -> valeur X
      const xVal = minX + (relativeX / size.width) * (maxX - minX);
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
              <div
                className="absolute max-w-xs p-2 transition-all duration-200 ease-out translate-y-2 border rounded shadow-lg opacity-0 pointer-events-none text-[7px] top-5 w-max border-node-outline bg-node-from-gradient group-hover:opacity-100 group-hover:translate-y-0"
              >
                <Latex>
                  {activationFunctions.find((f) => f.func === func)?.equation}
                </Latex>
              </div>
            </div>
            <p className="pb-[2px] h-fit">{functionType}(x)</p>
          </div>

          <svg
            width={size.width}
            height={size.height}
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
              className="absolute text-xs pointer-events-none text-node-text whitespace-nowrap"
              style={{
                // Position relative au container (px, py déjà en coordonnées locales SVG)
                left: Math.min(
                  Math.max(tooltip.px + 9, 0), // éviter sortie gauche
                  size.width - 60 // éviter sortie droite
                ),
                top: Math.min(
                  Math.max(tooltip.py - 9, 0), // éviter sortie haut
                  size.height - 20 // éviter sortie bas
                ),
              }}
            >
              {"(" + tooltip.value.x.toFixed(2)};{" "}
              {tooltip.value.y.toFixed(2) + ")"}
            </div>
          )}
        </WorkflowSubGrid>
      </div>
    );
  }
);

export default WorkflowChart;
