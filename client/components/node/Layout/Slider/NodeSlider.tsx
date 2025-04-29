"use client";

import { useState, useRef, useEffect } from "react";
import Handle from "@/components/handle/Handle";
import { Slider } from "@/components/ui/slider";
import { useFlowContext } from "@/context/FlowContext";

export default function NodeSlider({
  id,
  dataId,
  label,
  color,
  dvalue,
  onChange,
}: {
  id: string;
  dataId: string;
  label: string;
  color: string;
  dvalue: number;
  onChange?: (value: number) => void;
}) {
  const [value, setValue] = useState<number>(dvalue);
  const nodeIdRef = useRef<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const { updateNode } = useFlowContext();

  const handleValueChange = (val: number[]) => {
    if (onChange) {
      onChange(val[0])
    }
    if (val.length > 0) {
      setValue(val[0]);
      if (nodeIdRef.current) {
        updateNode(nodeIdRef.current, "values.input.units", val[0]);
      }
    }
  };

  useEffect(() => {
    if (ref.current) {
      const node = ref.current.closest(".node") as HTMLDivElement | null;
      if (node) {
        nodeIdRef.current = node.getAttribute("data-id");
      }
    }
  }, []);

  return (
    <div ref={ref}>
      <Handle type="target" id={id} dataId={dataId}>
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </Handle>
      <div style={{ padding: "0px 20px" }}>
        <div className="w-full space-y-2">
          <div className="undraggable flex items-center justify-between w-full gap-4 rounded-md border border-gray-300 px-4 py-2">
            <span className="text-sm text-gray-600 w-10 text-right">
              {value}
            </span>
            <Slider
              value={[value]}
              min={1}
              max={7}
              step={1}
              onValueChange={handleValueChange}
              rangeClassName={`bg-[${color}]`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
