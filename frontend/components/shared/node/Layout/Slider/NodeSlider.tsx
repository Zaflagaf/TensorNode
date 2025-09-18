"use client";

import { Input } from "@/frontend/components/ui/input";
import { Slider } from "@/frontend/components/ui/slider";
import { useFlowContext } from "@/frontend/context/FlowContext";
import Handle from "@/frontend/organism/Handle";
import { NodeType } from "@/frontend/schemas/node";
import { useEffect, useRef, useState } from "react";

export default function NodeSlider({
  id,
  port,
  label,
  color,
  node,
  defaultValue,
  onChange,
}: {
  id: string;
  port: string;
  label: string;
  color: string;
  node: NodeType
  defaultValue: number;
  onChange?: (value: number) => void;
}) {
  const [value, setValue] = useState<number>(defaultValue);
  const nodeIdRef = useRef<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const { updateNode } = useFlowContext();

  const update = (val: number) => {
    setValue(val);
    onChange?.(val);
    if (nodeIdRef.current) {
      updateNode(nodeIdRef.current, "values.input.units", val);
    }
  };

  const handleSliderChange = (val: number[]) => {
    if (val.length > 0) update(val[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    if (!isNaN(num) && num >= 0) update(num);
  };

  useEffect(() => {
    if (ref.current) {
      const node = ref.current.closest(".node") as HTMLDivElement | null;
      if (node) {
        nodeIdRef.current = node.id;
      }
    }
  }, []);

  return (
    <div ref={ref}>
      <Handle type="target" id={id} port={port} node={node}>
        <p className="mb-1 text-sm font-medium text-gray-700">{label}</p>
      </Handle>

      <div className="flex flex-col px-4 py-2 space-y-2 bg-white border border-gray-300 rounded-lg undraggable">
        <div className="flex items-center space-x-4">
          {/* Input à gauche */}
          <Input
            type="number"
            min={0}
            value={value}
            onChange={handleInputChange}
            className="w-24"
          />

          {/* Slider à droite */}
          <Slider
            value={[value]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleSliderChange}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
