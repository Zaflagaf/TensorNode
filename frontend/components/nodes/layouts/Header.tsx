import { cn } from "@/frontend/lib/utils";
import React from "react";

const WorkflowHeader = React.memo(
  ({ label, className }: { label: string; className: string }) => {
    return (
      <div
        className={cn(
          "px-4 py-2 text-xs font-semibold text-white bg-gradient-to-br rounded-t-[5px]",
          className
        )}
      >
        {label}
      </div>
    );
  }
);

export default WorkflowHeader;
