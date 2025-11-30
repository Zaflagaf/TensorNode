import { LucideProps } from "lucide-react";
import React from "react";

export interface PassivPanel {
  name: string;
  icon: React.ComponentType<LucideProps>;
  content: React.ReactNode;
  header: React.ReactNode;
}

export interface ActivPanel {
  id: string;
  type: "panel" | "split";
  name?: string;
  direction?: "horizontal" | "vertical";
  defaultSize?: number;
  size?: number;
  A?: ActivPanel;
  B?: ActivPanel;
}

export interface PanelManagerProps {
  panels: PassivPanel[];
}

export interface PanelProps {
  panel: ActivPanel;
  panelMap: Record<string, PassivPanel>;
  panels: PassivPanel[];
  onSplit: (
    nodeId: string,
    direction: "horizontal" | "vertical",
    size: number,
    cornerY: "top" | "bottom",
    cornerX: "left" | "right"
  ) => void;
  onPanelChange: (nodeId: string, panelName: string) => void;
  onResize?: (nodeId: string, newSize: number) => void;
}

export interface PanelHeaderProps {
  panel: ActivPanel;
  panels: PassivPanel[];
  panelMap: Record<string, PassivPanel>;
  onPanelChange: (name: string) => void;
  onSplit: (
    nodeId: string,
    direction: "horizontal" | "vertical",
    size: number,
    cornerY: "top" | "bottom",
    cornerX: "left" | "right"
  ) => void;
}
