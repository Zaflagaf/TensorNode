"use client";
import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/frontend/components/ui/shadcn/sidebar";

import { CompositorLayer } from "@/frontend/types";

import CollapsibleProperties from "../../layouts/Collapsible";
import MetricsSection from "./MetricsSection";
import TrainSection from "./TrainSection";

export default function CompositorLayerContent({
  layer,
}: {
  layer: CompositorLayer;
}) {
  const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>([]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-px">
        <CollapsibleProperties label="Metrics">
          <MetricsSection
            selectedMetrics={selectedMetrics}
            setSelectedMetrics={setSelectedMetrics}
          />
        </CollapsibleProperties>

        <CollapsibleProperties label="Train">
          <TrainSection selectedMetrics={selectedMetrics} />
        </CollapsibleProperties>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
