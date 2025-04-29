import Node from "../../Node";
import Handle from "@/components/handle/Handle";
import Header from "../../Layout/Header/NodeHeader";

import layers from "@/public/layers.svg";
import illustration from "@/public/illustration/conv2d.svg";

import NodeSlider from "../../Layout/Slider/NodeSlider";
import NodeSwitch from "../../Layout/Switch/NodeSwitch";
import NodeStats from "../../Layout/Stats/NodeStats";
import { Separator } from "@/components/ui/separator";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

const GRID_SIZE = 10;
const FILTER_SIZE = 1;

const Conv2DStrideVisualizer = React.memo(() => {
  const [stride, setStride] = useState(1);

  const generateGrid = useMemo(() => {
    const grid = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        grid.push({ row, col });
      }
    }
    return grid;
  }, []);

  const positions = useMemo(() => {
    const pos = [];
    for (let row = 0; row <= GRID_SIZE - FILTER_SIZE; row += stride) {
      for (let col = 0; col <= GRID_SIZE - FILTER_SIZE; col += stride) {
        pos.push({ row, col });
      }
    }
    return pos;
  }, [stride]);

  return (
    <div className="flex flex-col items-center gap-6 px-[20px]">
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium">Stride:</span>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setStride(s)}
            className={`px-3 py-1 rounded border text-sm font-medium transition-colors ${
              stride === s
                ? "bg-[#a1af5e] text-white"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="relative grid grid-cols-10 gap-1">
        {generateGrid.map(({ row, col }) => (
          <div
            key={`${row}-${col}`}
            className="w-8 h-8 bg-gray-100 border border-gray-300 rounded-sm"
            style={{
              top: row * 36,
              left: col * 36,
            }}
          />
        ))}

        {positions.map(({ row, col }, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.01 }}
            className="absolute w-8 h-8 rounded-md border-2 border-[#a1af5e] bg-[#a1af5e]/20"
            style={{
              top: row * 36, // 32px size + 4px gap
              left: col * 36,
            }}
          />
        ))}
      </div>
    </div>
  );
});

function Conv2DNodeComponent({
  id,
  position,
  label,
}: {
  id: string;
  position: { x: number; y: number };
  label: string;
}) {
  return (
    <Node id={id} defaultPosition={position}>
      <div className="conv2d" id={id}>
        <Header
          label={label}
          id={id}
          logo={layers}
          illustration={illustration}
        />
        <div
          className="conv2d-body"
          style={{ display: "flex", flexDirection: "column", gap: "5px" }}
        >
          <Handle type="source" id="h1">
            Layer
          </Handle>
          <div style={{ position: "absolute" }}>
            <Handle type="target" id="h2">
              Layer
            </Handle>
          </div>
          <Separator className="my-4 bg-gray-300 h-[2px]" />
          <NodeSlider id="h3" label="Filters" color="#a1af5e" dataId="filters" dvalue={1}/>
          <NodeSwitch id="h4" label="Kernel Size" color="#a1af5e" dataId="kernel_size"/>
          <NodeSwitch id="h4" label="Strides" color="#a1af5e" />
          <Handle type="target" id="h5">
            Activation
          </Handle>
          {/* Visualiseur Conv2D avec strides */}
          <Conv2DStrideVisualizer />
        </div>
        <Separator className="my-4 bg-gray-300 h-[2px]" />
        <NodeStats />
        <div
          className="conv2d-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
          }}
        />
      </div>
    </Node>
  );
}

export default Conv2DNodeComponent;
