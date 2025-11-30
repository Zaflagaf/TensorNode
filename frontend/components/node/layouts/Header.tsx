import { cn } from "@/frontend/lib/utils";
import { IconKeys } from "@/frontend/types";
import * as Icons from "lucide-react";
import { Component } from "lucide-react";
import React from "react";

const WorkflowHeader = React.memo(
  ({
    label,
    icon,
    className,
  }: {
    label: string;
    icon?: IconKeys;
    className: string;
  }) => {
    const IconComponent = icon ? Icons[icon] : Component;

    return (
      <div
        className={cn(
          "px-3 py-1 font-semibold text-foreground rounded-t-xs flex gap-2 items-center text-xxs",
          className
        )}
      >
        <IconComponent className="size-4" />
        {label}
      </div>
    );
  }
);

export default WorkflowHeader;
