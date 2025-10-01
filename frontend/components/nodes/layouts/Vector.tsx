import { Button } from "@/frontend/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/frontend/components/ui/tooltip";
import { Info, PlusCircle, Trash2 } from "lucide-react";
import React from "react";
import WorkflowNumber from "./Number";

const WorkflowVector = ({
  vector,
  setVector,
  type,
}: {
  vector: number[];
  setVector: React.Dispatch<React.SetStateAction<number[]>>;
  type?: "int" | "float"
}) => {
  const handleShapeChange = (index: number, value: number) => {
    if (!vector) return;
    const newVector = [...vector];
    newVector[index] = value;
    setVector(newVector);
  };

  const addDimension = () => {
    if (!vector) return;
    setVector([...vector, 5]);
  };

  const removeDimension = (index: number) => {
    if (!vector) return;
    if (vector.length > 1) {
      setVector(vector.filter((_, i) => i !== index));
    }
  };

  return (
    <>
      <div className="flex items-center justify-between text-node-text">
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

      <div className="flex flex-col undraggable max-h-[200px] overflow-y-auto pr-1">
        {vector?.map((val, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <WorkflowNumber
              number={val}
              setNumber={(value: number) => handleShapeChange(i, value)}
              label={`Dim. ${i}`}
              type={type}
            />
            <Button
              size="icon"
              onClick={() => removeDimension(i)}
              className="bg-transparent cursor-pointer h-7 w-7 text-node-text group-hover:text-node-text-hover"
              disabled={vector.length <= 1}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default WorkflowVector;
