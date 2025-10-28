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
    );
  }
);

export default WorkflowBoolean;
