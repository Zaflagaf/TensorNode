"use client";

import { PanelProps } from "@/frontend/types";
import { memo } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../../shadcn/resizable";
import { CornerSplitButton } from "./corner-split-button";
import { WorkflowPanelHeader } from "./panel-header";

export const WorkflowPanel = (
  ({ panel, panelMap, panels, onSplit, onPanelChange }: PanelProps) => {
    if (panel.type === "panel") {
      const currentPanel = panelMap[panel.name || "Outliner"];

      return (
        <div className="w-full h-full flex flex-col bg-panel-bg border border-panel-border rounded-sm overflow-hidden relative ">
          <WorkflowPanelHeader
            panel={panel}
            panelMap={panelMap}
            panels={panels}
            onPanelChange={(name) => onPanelChange(panel.id, name)}
            onSplit={onSplit}
          />
          <div className="flex-1 overflow-auto bg-panel-content">
            {currentPanel?.content}
          </div>

          <CornerSplitButton
            cornerY="top"
            cornerX="left"
            onSplit={(direction, size, cy, cx) =>
              onSplit(panel.id, direction, size, cy, cx)
            }
          />
          <CornerSplitButton
            cornerY="top"
            cornerX="right"
            onSplit={(direction, size, cy, cx) =>
              onSplit(panel.id, direction, size, cy, cx)
            }
          />
          <CornerSplitButton
            cornerY="bottom"
            cornerX="left"
            onSplit={(direction, size, cy, cx) =>
              onSplit(panel.id, direction, size, cy, cx)
            }
          />
          <CornerSplitButton
            cornerY="bottom"
            cornerX="right"
            onSplit={(direction, size, cy, cx) =>
              onSplit(panel.id, direction, size, cy, cx)
            }
          />
        </div>
      );
    }

    const isHorizontal = panel.direction === "horizontal";
    const defaultASize = panel.A?.defaultSize || 50;
    const defaultBSize = panel.B?.defaultSize || 50;

    return (
      <ResizablePanelGroup
        direction={isHorizontal ? "horizontal" : "vertical"}
        className="w-full h-full gap-px"
      >
        {panel.A && (
          <ResizablePanel defaultSize={defaultASize} minSize={15}>
            <WorkflowPanel
              panel={panel.A}
              panelMap={panelMap}
              panels={panels}
              onSplit={onSplit}
              onPanelChange={onPanelChange}
            />
          </ResizablePanel>
        )}

        {panel.A && panel.B && (
          <ResizableHandle className="bg-divider-hover hover:bg-accent/50 transition-colors" />
        )}

        {panel.B && (
          <ResizablePanel defaultSize={defaultBSize} minSize={15}>
            <WorkflowPanel
              panel={panel.B}
              panelMap={panelMap}
              panels={panels}
              onSplit={onSplit}
              onPanelChange={onPanelChange}
            />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    );
  }
);
