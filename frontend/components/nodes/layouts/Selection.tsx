"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/shadcn/dropdown-menu"; // adjust path if needed
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
  labels?: Record<string, string>; // Nouveau : mapping id → label affiché
}

export default function WorkflowSelection({
  selection,
  setSelection,
  choices,
  label,
  labels = {},
}: WorkflowSelectionProps) {
  const isGrouped = !Array.isArray(choices);

  const getLabel = (value: string) => labels[value] ?? value; // si label fourni, sinon id

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="bg-foreground/5 rounded-[4px] py-[4px] px-[8px] flex justify-between items-center gap-[5px] text-muted-foreground hover:text-foreground text-xs cursor-pointer w-full">
          <p>{getLabel(selection) || label}</p>
          <ChevronDown className="w-4 h-4 stroke-1" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-card">
        <div className="w-full h-fit top-0 left-0 absolute bg-card rounded-[4px] shadow-lg border border-border ">
          <div className="bg-foreground/5 w-full h-full p-1">
            {isGrouped
              ? Object.entries(choices as Record<string, string[]>).map(
                  ([groupLabel, options], index) => (
                    <React.Fragment key={groupLabel}>
                      {index > 0 && (
                        <DropdownMenuSeparator className="border-t border-border my-1" />
                      )}
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                          {groupLabel}
                        </DropdownMenuLabel>
                        {options.map((choice) => (
                          <DropdownMenuItem
                            key={choice}
                            className={cn(
                              "px-2 py-1 text-xs text-foreground rounded-xs cursor-pointer",
                              choice === selection
                                ? "bg-secondary hover:bg-gradient-to-br"
                                : ""
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
                      "px-2 py-1 text-xs text-muted-foreground hover:bg-foreground/5 rounded-xs cursor-pointer",
                      choice === selection ? "bg-foreground/5" : ""
                    )}
                    onClick={() => setSelection(choice)}
                  >
                    {getLabel(choice)}
                  </DropdownMenuItem>
                ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
