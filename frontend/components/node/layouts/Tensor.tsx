import { formatNumberInput } from "@/frontend/lib/pattern";
import { Trash2 } from "lucide-react";
import type React from "react";
import { useRef, useState, type ChangeEvent } from "react";

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
  type = "float",
}) => {
  const [textValues, setTextValues] = useState<string[]>(
    tensor.map((v) => v.toString())
  );

  // refs pour chaque input
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    const value = formatNumberInput(e);

    setTextValues((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });

    // --- Update tensor only if complete number ---
    const normalized = value.replace(",", ".");
    const isPartialScientific = /e[\+\-]?$/.test(normalized);
    if (
      normalized !== "" &&
      !isNaN(Number(normalized)) &&
      !isPartialScientific
    ) {
      const numericValue = parseFloat(normalized);
      setTensor((prev) => {
        const updated = [...prev];
        updated[idx] = numericValue;
        return updated;
      });
    }
  };

  const addDimension = () => {
    setTensor((prev) => [...prev, type === "int" ? 1 : 1.0]);
    setTextValues((prev) => [...prev, "1"]);
  };

  const removeDimension = (index: number) => {
    setTensor((prev) => prev.filter((_, i) => i !== index));
    setTextValues((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="undraggable gap-[2px] flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-xxs text-muted-foreground">
          {label ?? "Values"}
        </span>
      </div>

      <div className="flex flex-col gap-[2px] max-h-[200px] overflow-y-auto">
        {textValues.map((val, i) => (
          <div
            key={i}
            className="flex items-center gap-1 bg-muted/75 rounded-xs px-[8px] py-[2px] transition-colors group"
          >
            <input
              type="text"
              ref={(el) => (inputRefs.current[i] = el)}
              value={val}
              onChange={(e) => handleChange(e, i)}
              className="flex w-full text-muted-foreground text-xxs border-0 outline-none focus:text-foreground undeletable"
            />

            <button
              onClick={() => removeDimension(i)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        ))}
        <button
          onClick={addDimension}
          className="text-xxs text-muted-foreground hover:text-foreground flex"
        >
          + Add
        </button>
      </div>
    </div>
  );
};

export default WorkflowTensor;
