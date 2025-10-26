import { cn } from "@/frontend/lib/utils";
import { Component, Hexagon } from "lucide-react";
import React from "react";

const WorkflowHeader = React.memo(
  ({ label, className }: { label: string; className: string }) => {
    return (
      <div
        className={cn(
          "px-4 py-2 text-xs font-semibold text-foreground rounded-t-[5px] flex gap-2 items-center",
          className
        )}
      >
        <Component className="size-4"/>
        {label}
      </div>
    );
  }
);

export default WorkflowHeader;
