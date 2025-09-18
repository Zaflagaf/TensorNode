import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { useFlowContext } from "@/frontend/context/FlowContext";
import Handle from "@/frontend/organism/Handle";
import layers from "@/public/svg/layers.svg";
import { useEffect, useState } from "react";
import Node from "../../../../../organism/Node";
import NodeHeader from "../../Layout/Header/NodeHeader";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/frontend/components/ui/tooltip";
import { Info, PlusCircle, Trash2 } from "lucide-react";

// Helper pour générer un ID unique
const generateId = () => Math.random().toString(36).substring(2, 9);

type VectorItem = {
  id: string;
  value: number;
};

export function VectorNodeComponent({
  id,
  position,
  label,
  values,
}: {
  id: string;
  position: { x: number; y: number };
  label: string;
  values: any;
}) {
  const [vector, setVector] = useState<VectorItem[]>(
    values?.input?.data?.length
      ? values.input.data
      : [12, 12, 12].map((v) => ({ id: generateId(), value: v }))
  );

  const { updateNode, nodes } = useFlowContext();

  const updateDimension = (id: string, newValue: string) => {
    const val = parseFloat(newValue);
    if (isNaN(val)) return;

    setVector((prev) =>
      prev.map((item) => (item.id === id ? { ...item, value: val } : item))
    );
  };

  const addDimension = () => {
    setVector((prev) => [...prev, { id: generateId(), value: 1 }]);
  };

  const removeDimension = (id: string) => {
    setVector((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const valuesOnly = vector.map((item) => item.value);
    updateNode(id, "values.output.data", [valuesOnly]);
  }, [vector]);

  return (
    <Node id={id} defaultPosition={position}>
      <div className="vector" id={id}>
        <NodeHeader label={label} id={id} logo={layers} />
        <Handle type="source" id="vector-h1" dataId="data">
          <div></div>
        </Handle>

        <div className="px-5 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-medium">Dimensions</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      Define the shape dimensions for this layer
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={addDimension}
              className="px-2 text-xs h-7"
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>

          <div className="flex flex-col gap-2 undraggable max-h-[200px] overflow-y-auto pr-1">
            {vector.map((item, i) => (
              <div key={item.id} className="flex items-center gap-2 group">
                <div className="flex-shrink-0 w-6 text-xs text-center text-muted-foreground">
                  {i + 1}
                </div>
                <Input
                  type="number"
                  value={item.value}
                  onChange={(e) => updateDimension(item.id, e.target.value)}
                  className="h-8 text-sm"
                  min={1}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDimension(item.id)}
                  className="h-7 w-7 opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  disabled={vector.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Node>
  );
}

export default VectorNodeComponent;
