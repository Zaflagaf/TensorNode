"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/shadcn/dropdown-menu";
import { PanelHeaderProps } from "@/frontend/types";
import { ChevronDown } from "lucide-react";
import { memo } from "react";

export const WorkflowPanelHeader = memo(
  ({ panel, panels, panelMap, onPanelChange }: PanelHeaderProps) => {
    const currentPanel = panelMap[panel.name || "Outliner"];

    return (
      <div className="flex items-center justify-between px-1 py-px bg-panel-header border-b border-panel-border">
        <div className="flex items-center gap-2 flex-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-1 py-1 rounded-xs text-xxs font-medium text-panel-header-text hover:bg-panel-header-hover transition-colors focus:outline-none focus:ring-0">
                <currentPanel.icon className="size-3" />
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              side="bottom"
              sideOffset={1}
              alignOffset={-4}
              className="bg-background border border-panel-border rounded-xs shadow-lg min-w-48"
            >
              {panels.map((panel) => (
                <DropdownMenuItem
                  key={panel.name}
                  onClick={() => onPanelChange(panel.name)}
                  className="flex gap-1 cursor-pointer px-1 py-1 rounded-xs text-muted-foreground hover:text-foreground hover:bg-panel-dropdown-hover"
                >
                  <span>
                    <panel.icon className="size-3" />
                  </span>
                  <span className="text-xxs">{panel.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex w-full">
              {panelMap[panel.name || "Outliner"].header}
          </div>
        </div>
      </div>
    );
  }
);
