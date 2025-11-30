"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/shadcn/dropdown-menu";
import { cn } from "@/frontend/lib/utils";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import * as React from "react";

interface WorkflowSelectionProps {
  selection: string;
  setSelection: (
    value: string
  ) => void | React.Dispatch<React.SetStateAction<string>>;
  choices: string[] | Record<string, string[]>;
  label?: string;
  labels?: Record<string, string>;
}

export default function WorkflowSelection({
  selection,
  setSelection,
  choices,
  label,
  labels = {},
}: WorkflowSelectionProps) {
  const isGrouped = !Array.isArray(choices);

  const getLabel = (value: string) => labels[value] ?? value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="bg-muted/75 flex items-center justify-between gap-[5px] px-[8px] py-[2px] text-xxs text-muted-foreground transition-colors duration-200 rounded-xs hover:text-foreground cursor-pointer group">
          <span className="truncate">{getLabel(selection) || label}</span>
          <ChevronDown className="w-3 h-3 stroke-2 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48 p-0 bg-card border border-border/50 shadow-lg rounded-xs overflow-hidden">
        <div className="bg-card">
          {isGrouped
            ? Object.entries(choices as Record<string, string[]>).map(
                ([groupLabel, options], index) => (
                  <React.Fragment key={groupLabel}>
                    {index > 0 && (
                      <DropdownMenuSeparator className="border-t border-border/30 my-0" />
                    )}
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="!text-xxs font-semibold text-muted-foreground/50 px-[8px] py-[4px] ">
                        {groupLabel}
                      </DropdownMenuLabel>
                      {options.map((choice) => (
                        <DropdownMenuItem
                          key={choice}
                          className={cn(
                            "px-[8px]  py-[4px] !text-xxs cursor-pointer transition-colors duration-150 rounded-none m-0",
                            choice === selection
                              ? "bg-card-foreground/5 text-foreground font-medium "
                              : "text-muted-foreground hover:text-foreground hover:bg-card-foreground/5"
                          )}
                          onClick={() => setSelection(choice)}
                        >
                          {getLabel(choice)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </React.Fragment>
                )
              )
            : (choices as string[]).map((choice) => (
                <DropdownMenuItem
                  key={choice}
                  className={cn(
                    "px-[8px] py-[4px] !text-xxs cursor-pointer transition-colors duration-150 rounded-none m-0",
                    choice === selection
                      ? "bg-card-foreground/5 text-foreground font-medium "
                      : "text-muted-foreground hover:text-foreground hover:bg-card-foreground/5"
                  )}
                  onClick={() => setSelection(choice)}
                >
                  {getLabel(choice)}
                </DropdownMenuItem>
              ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
