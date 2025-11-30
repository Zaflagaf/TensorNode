"use client";

import { cn } from "@/frontend/lib/utils";
import React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/shadcn/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

interface WorkflowNumberProps {
  label: React.ReactNode;
  children: React.ReactNode;
}

const WorkflowCollapsible: React.FC<WorkflowNumberProps> = React.memo(
  ({ label, children }) => {
    return (
      <div>
        <Collapsible>
          <CollapsibleTrigger
            className={cn(
              "rounded-xs py-[2px] flex items-center !text-muted-foreground text-xxs !hover:text-foreground !active:bg-card-foreground/20 !focus-within:bg-card-foreground/20 w-full group"
            )}
          >
            <ChevronRight className="size-3 group-data-[state=open]:rotate-90"/>
            {label}
          </CollapsibleTrigger>
          <CollapsibleContent className="text-xxs text-muted-foreground flex flex-col h-fit gap-[2px]">{children}</CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
);

WorkflowCollapsible.displayName = "WorkflowCollapsible";
export default WorkflowCollapsible;
