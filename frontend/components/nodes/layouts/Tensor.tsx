import { Button } from "@/frontend/components/ui/shadcn/button";
import { cn } from "@/frontend/lib/utils";
import { PlusCircle, Trash2 } from "lucide-react";
import React, { ChangeEvent } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../ui/shadcn/input-group";

type Props = {
  tensor: number[];
  setTensor: React.Dispatch<React.SetStateAction<number[]>>;
  label?: string;
  type?: "int" | "float";
};
const WorkflowTensor: React.FC<Props> = ({
  tensor = [],
  setTensor,
  label,
  type,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    const value = e.target.value;

    // Validation du format numérique
    if (type === "int" && /[^0-9\-]/.test(value)) return;
    if (type === "float" && /[^0-9.\-]/.test(value)) return;

    // Conversion en nombre (ou NaN si vide)
    const numericValue =
      value === "" ? NaN : type === "int" ? parseInt(value) : parseFloat(value);

    setTensor((prev) => {
      const updated = [...prev];
      updated[idx] = isNaN(numericValue) ? 0 : numericValue;
      return updated;
    });
  };

  const addDimension = () => {
    setTensor((prev) => [...prev, 1]);
  };

  const removeDimension = (index: number) => {
    setTensor((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="flex items-center justify-between text-node-text mb-1">
        <span className="text-xs ml-1">{label ?? "Tensor shape"}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={addDimension}
          className="text-xs h-5"
        >
          <PlusCircle className="size-3.5 mr-1" />
          Add
        </Button>
      </div>

      <div className="flex flex-col undraggable max-h-[200px] overflow-visible gap-[3px]">
        {tensor.map((val, i) => (
          <InputGroup
            key={i}
            className={cn(
              "bg-card-foreground/5 rounded-[4px] h-[23px] gap-[5px] flex text-muted-foreground hover:text-foreground text-xs",
              "dark:focus-within:bg-card-foreground/20 focus-within:bg-card-foreground/20 !ring-0 w-full border-0"
            )}
          >
            <InputGroupAddon>
              <InputGroupText>{`[ ${i} ]`}</InputGroupText>
            </InputGroupAddon>

            <InputGroupInput
              value={isNaN(val) ? "" : val.toString()}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addDimension();
                if (e.key === "Backspace" && e.currentTarget.value === "")
                  removeDimension(i);
              }}
            />

            <InputGroupAddon
              align="inline-end"
              onClick={() => removeDimension(i)}
              className="cursor-pointer hover:text-red-500"
            >
              <Trash2 className="size-3.5" />
            </InputGroupAddon>
          </InputGroup>
        ))}
      </div>
    </>
  );
};

export default WorkflowTensor;
