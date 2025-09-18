import { Switch } from "@/frontend/components/ui/switch";
import Handle from "@/frontend/organism/Handle";
import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { useEffect, useRef, useState } from "react";

export default function NodeSwitch({ node }: { node: NodeType }) {
  const [value, setValue] = useState<boolean>(true);
  const nodeIdRef = useRef<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  const setNodeInput = useNodesStore((state) => state.actions.setNodeInput);

  const handleValueChange = (val: boolean) => {
    setValue(val);
    if (nodeIdRef.current) {
      setNodeInput(node.id, "useBias", val);
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
      <Handle type="target" id={id} port={port} node={node}>
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </Handle>
      <div className="w-full space-y-2" style={{ padding: "0px 20px" }}>
        <div className="flex items-center justify-between w-full gap-4 px-4 py-2 border border-gray-300 rounded-md undraggable">
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
