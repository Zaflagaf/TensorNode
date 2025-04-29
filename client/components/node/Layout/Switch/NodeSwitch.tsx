import { useState, useRef, useEffect } from "react";
import Handle from "@/components/handle/Handle";
import { Switch } from "@/components/ui/switch";
import { useFlowContext } from "@/context/FlowContext";

interface NodeSwitchProps {
  id: string;
  dataId: string;
  label: string;
  color: string;
  className?: string;
}

export default function NodeSwitch({
  id,
  dataId,
  label,
  color,
  className,
}: NodeSwitchProps) {
  const [value, setValue] = useState<boolean>(true);
  const nodeIdRef = useRef<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const { updateNode } = useFlowContext();

  const handleValueChange = (val: boolean) => {
    setValue(val);
    if (nodeIdRef.current) {
      updateNode(nodeIdRef.current, "values.input.useBias", val);
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
    <div ref={ref} className={className}>
      <Handle type="target" id={id} dataId={dataId}>
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </Handle>
      <div className="w-full space-y-2" style={{ padding: "0px 20px" }}>
        <div className="undraggable flex items-center justify-between w-full gap-4 rounded-md border border-gray-300 px-4 py-2">
          <span className="text-sm text-gray-600">
            {value ? "True" : "False"}
          </span>
          <Switch
            checked={value}
            onCheckedChange={handleValueChange}
            colorHex={color}
          />
        </div>
      </div>
    </div>
  );
}
