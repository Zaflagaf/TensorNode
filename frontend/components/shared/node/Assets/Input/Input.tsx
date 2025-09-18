"use client";

import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Separator } from "@/frontend/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/frontend/components/ui/tooltip";
import { useFlowContext } from "@/frontend/context/FlowContext";
import layers from "@/public/svg/layers.svg";
import { Info, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Handle from "../../../../../organism/Handle";
import Node from "../../../../../organism/Node";
import Header from "../../Layout/Header/NodeHeader";
import ShapeVisualizer from "../../Layout/ShapeVZ/ShapeVZ";

function InputNodeComponent({
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
  const [shape, setShape] = useState<number[]>([40, 50, 50, 50]);
  const { nodes, updateNode } = useFlowContext();

  useEffect(() => {
    if (!nodes[id]["data"]["values"]["output"]) return;
    const shpe = nodes[id]["data"]["values"]["output"]["layer"];
    if (!shpe) return;

    setShape(shpe);
  }, []);

  useEffect(() => {
    updateNode(id, "values.output.layer", shape);
  }, [shape]);

  const handleShapeChange = (index: number, value: number) => {
    const newShape = [...shape];
    newShape[index] = value;
    setShape(newShape);
  };

  const addDimension = () => {
    setShape([...shape, 50]);
  };

  const removeDimension = (index: number) => {
    if (shape.length > 1) {
      setShape(shape.filter((_, i) => i !== index));
    }
  };

  return (
    <Node id={id} defaultPosition={position}>
      <div
        className="border rounded-lg shadow-sm input border-border bg-card"
        id={id}
      >
        <Header label={label} id={id} logo={layers} />

        <Separator className="my-1" />
        <Handle type="source" id="input-h1" dataId="layer">
          <div className="flex items-center justify-between gap-[10px]">
            <span className="font-medium">Shape</span>
            <Badge variant="outline" className="text-xs">
              {shape.length}D
            </Badge>
          </div>
        </Handle>
        <div className="flex flex-col gap-3 p-3 input-body">
          <div className="flex items-center justify-center p-3 rounded-md bg-muted/30">
            <ShapeVisualizer dimensions={shape} />
          </div>

          <div className="space-y-3">
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
              {shape.map((val, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <div className="flex-shrink-0 w-6 text-xs text-center text-muted-foreground">
                    {i + 1}
                  </div>
                  <Input
                    type="number"
                    defaultValue={val}
                    onChange={(e) =>
                      handleShapeChange(i, Number(e.target.value))
                    }
                    className="h-8 text-sm"
                    min={1}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDimension(i)}
                    className="h-7 w-7 opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                    disabled={shape.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-1" />

        <div className="flex items-center justify-between px-4 py-2 text-xs input-footer text-muted-foreground">
          <span>
            Total: {shape.reduce((a, b) => a * b, 1).toLocaleString()}
          </span>
        </div>
      </div>
    </Node>
  );
}

export default InputNodeComponent;
