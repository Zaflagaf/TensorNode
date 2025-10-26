import { cn } from "@/frontend/lib/utils";
import { Check } from "lucide-react";
import React from "react";

const WorkflowBoolean = React.memo(
  ({
    boolean,
    setBoolean,
    label,
  }: {
    boolean: boolean;
    setBoolean: React.Dispatch<React.SetStateAction<boolean>>;
    label: string;
  }) => {
    return (
      <div
        className="bg-card-foreground/5 rounded-[4px] py-[4px] px-[8px] flex cursor-pointer items-center gap-[5px] text-muted-foreground hover:text-foreground text-xs"
        onClick={() => setBoolean((prev) => !prev)}
      >
        <div
          className={cn(
            "rounded-[2px] h-[13px] w-[13px] flex justify-center items-center ",
            boolean ? "bg-hue-180" : "bg-card-foreground/5"
          )}
        >
          <Check className={cn("w-full h-full", boolean ? "flex" : "hidden")} />
        </div>
        <p>{label}</p>
      </div>

      /*     <div className="flex items-center gap-2 mx-2 px-2 py-1.5 bg-slate-50 rounded-md border border-slate-200 hover:border-slate-300 transition-colors">
      <Checkbox.Root
        checked={boolean}
        onCheckedChange={(value: boolean) => {
          setBoolean(value)
        }}
        className="undraggable flex items-center justify-center w-4 h-4 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-slate-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 transition-colors"
      >
        <Checkbox.Indicator className="text-white">
          <CheckIcon className="w-3 h-3" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label className="flex-1 min-w-0 font-medium cursor-pointer select-none text-slate-900">{label}</label>
    </div> */
    );
  }
);

export default WorkflowBoolean;
