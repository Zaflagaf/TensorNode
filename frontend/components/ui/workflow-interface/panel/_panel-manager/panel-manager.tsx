"use client";

import { ActivPanel, PanelManagerProps, PassivPanel } from "@/frontend/types";
import {
  Clock,
  FolderTree,
  Route,
  TerminalSquareIcon,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";
import WorkflowNodePanel from "../node-panel/NodePanel";
import WorkflowOutlinerHeader from "../outliner-panel/OutlinerHeader";
import WorkflowOutlinerPanel from "../outliner-panel/OutlinerPanel";
import WorkflowPropertiesPanel from "../properties-panel/PropertiesPanel";
import WorkflowTerminalPanel from "../terminal-panel/TerminalPanel";
import WorkflowTimelinePanel from "../timeline-panel/TimelinePanel";
import { WorkflowPanel } from "./panel-entity";

export const panels: PassivPanel[] = [
  {
    name: "Workflow",
    icon: Workflow,
    content: <WorkflowNodePanel />,
    header: null,
  },
  {
    name: "Outliner",
    icon: FolderTree,
    content: <WorkflowOutlinerPanel />,
    header: <WorkflowOutlinerHeader />,
  },
  {
    name: "Properties",
    icon: Route,
    content: <WorkflowPropertiesPanel />,
    header: null,
  },
  {
    name: "Timeline",
    icon: Clock,
    content: <WorkflowTimelinePanel />,
    header: null,
  },
  {
    name: "Terminal",
    icon: TerminalSquareIcon,
    content: <WorkflowTerminalPanel />,
    header: null,
  },
];

export function WorkflowPanelManager({ panels }: PanelManagerProps) {
  const [layout, setLayout] = useState<ActivPanel>({
    id: "root",
    type: "split",
    direction: "horizontal",
    defaultSize: 100,

    A: {
      id: "sp1",
      type: "split",
      direction: "vertical",
      defaultSize: 80,
      A: {
        id: "spp1",
        type: "panel",
        name: "Workflow",
        defaultSize: 80,
      },
      B: {
        id: "spp2",
        type: "panel",
        name: "Terminal",
        defaultSize: 20,
      },
    },
    B: {
      id: "p1",
      type: "split",
      direction: "vertical",
      defaultSize: 20,
      A: { id: "sp2", type: "panel", name: "Outliner", defaultSize: 35 },
      B: {
        id: "sp3",
        type: "panel",
        name: "Properties",
        defaultSize: 65,
      },
    },
  });

  const panelMap = useMemo(() => {
    const map: Record<string, PassivPanel> = {};
    panels.forEach((panel) => {
      map[panel.name] = panel;
    });
    return map;
  }, [panels]);

  const handleSplit = (
    panelId: string,
    direction: "horizontal" | "vertical",
    size: number,
    cornerY: "top" | "bottom",
    cornerX: "left" | "right"
  ) => {
    const split = (panel: ActivPanel): ActivPanel => {
      if (panel.id === panelId && panel.type === "panel") {
        const isStartCorner =
          direction === "horizontal" ? cornerX === "left" : cornerY === "top";

        const ASize = isStartCorner ? size : 100 - size;
        const BSize = 100 - ASize;

        return {
          id: `split-${panelId}`,
          type: "split",
          direction,
          defaultSize: panel.defaultSize || 100,
          A: {
            id: `${panelId}-A`,
            type: "panel",
            name: panel.name,
            defaultSize: ASize,
          },
          B: {
            id: `${panelId}-B`,
            type: "panel",
            name: panel.name,
            defaultSize: BSize,
          },
        };
      }

      return {
        ...panel,
        A: panel.A ? split(panel.A) : undefined,
        B: panel.B ? split(panel.B) : undefined,
      };
    };

    setLayout(split(layout));
  };

  const handlePanelChange = (panelId: string, name: string) => {
    const update = (panel: ActivPanel): ActivPanel => {
      if (panel.id === panelId && panel.type === "panel") {
        return { ...panel, name };
      }
      return {
        ...panel,
        A: panel.A ? update(panel.A) : undefined,
        B: panel.B ? update(panel.B) : undefined,
      };
    };

    setLayout(update(layout));
  };

  return (
    <WorkflowPanel
      panel={layout}
      panelMap={panelMap}
      panels={panels}
      onSplit={handleSplit}
      onPanelChange={handlePanelChange}
    />
  );
}
