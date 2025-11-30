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
        className="bg-muted/75 rounded-xs py-[2px] px-[8px] flex cursor-pointer items-center gap-[5px] text-muted-foreground hover:text-foreground text-xxs"
        onClick={() => setBoolean((prev) => !prev)}
      >
        <div
          className={cn(
            "size-3 rounded-xs flex justify-center items-center ",
            boolean ? "text-primary bg-card-foreground/5" : "bg-card-foreground/5"
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
