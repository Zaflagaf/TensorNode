"use client";
import * as React from "react";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/frontend/components/ui/shadcn/accordion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/frontend/components/ui/shadcn/sidebar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/frontend/components/ui/shadcn/tabs";

import { useLayersStore } from "@/frontend/organism/canvas/store/layersStore";
import { CompositorLayer, ModelLayer } from "@/frontend/types";
import {
  Blocks,
  BrainCircuit,
  ChartArea,
  Download,
  Network,
  Package,
  Ruler,
} from "lucide-react";

import MetricsSection from "./compositor-layouts/MetricsSection";
import TrainSection from "./compositor-layouts/TrainSection";
import BuildSection from "./model-layouts/BuildSections";
import DownloadSection from "./model-layouts/DownloadSection";
import HistorySection from "./model-layouts/HistorySection";

const ModelLayerContent = ({ layer }: { layer: ModelLayer }) => {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <Accordion
          type="multiple"
          defaultValue={["build", "history", "download"]}
        >
          <AccordionItem value="build">
            <AccordionTrigger>
              <span className="inline-flex items-center justify-center gap-2 text-xs">
                <Blocks className="w-4" />
                <span>Build</span>
              </span>
            </AccordionTrigger>
            <BuildSection layer={layer} />
          </AccordionItem>

          <AccordionItem value="history">
            <AccordionTrigger>
              <span className="inline-flex items-center justify-center gap-2 text-xs">
                <ChartArea className="w-4" />
                <span>History</span>
              </span>
            </AccordionTrigger>
            <HistorySection layer={layer} />
          </AccordionItem>

          <AccordionItem value="download">
            <AccordionTrigger>
              <span className="inline-flex items-center justify-center gap-2 text-xs">
                <Download className="w-4" />
                <span>Download</span>
              </span>
            </AccordionTrigger>
            <DownloadSection layer={layer}/>
          </AccordionItem>
        </Accordion>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const CompositorLayerContent = ({ layer }: { layer: CompositorLayer }) => {
  const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>([]);

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <Accordion type="multiple" defaultValue={["metrics", "train"]}>
          <AccordionItem value="metrics">
            <AccordionTrigger>
              <span className="inline-flex items-center justify-center gap-1 text-xs">
                <Ruler className="w-4" />
                <span>Metrics</span>
              </span>
            </AccordionTrigger>
            <MetricsSection
              selectedMetrics={selectedMetrics}
              setSelectedMetrics={setSelectedMetrics}
            />
          </AccordionItem>

          <AccordionItem value="train">
            <AccordionTrigger>
              <span className="inline-flex items-center justify-center gap-1 text-xs">
                <BrainCircuit className="w-4" />
                <span>Train</span>
              </span>
            </AccordionTrigger>
            <TrainSection selectedMetrics={selectedMetrics} />
          </AccordionItem>
        </Accordion>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const WorkflowRightSidebar = React.memo(
  ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const layers = useLayersStore((state) => state.layers);
    const currentLayer = useLayersStore((state) => state.currentLayer);
    const [activeTab, setActiveTab] = React.useState(currentLayer ?? "");

    return (
      <Sidebar
        {...props}
        collapsible="none"
        side="right"
        className="h-[100svh]  overflow-scroll border-l border-sidebar-border"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <SidebarHeader className="bg-background/50 rounded-b-lg overflow-x-scroll">
            <TabsList className="bg-transparent">
              {Object.values(layers).map((layer) => (
                <TabsTrigger
                  value={layer.id}
                  key={layer.id}
                  className="relative text-xs"
                >
                  {layer.type === "model" ? <Network /> : <Package />}
                  {layer.name}
                  <span className="absolute w-4 px-1 h-4 leading-none top-0 right-0 bg-punchy rounded-full -translate-y-1/2 translate-x-1/2 text-sm overflow-hidden flex justify-center items-center">
                    !
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </SidebarHeader>

          <SidebarContent>
            {Object.values(layers).map((layer) => (
              <div
                key={layer.id}
                style={{ display: activeTab === layer.id ? "block" : "none" }}
              >
                {layer.type === "model" ? (
                  <ModelLayerContent layer={layer as ModelLayer} />
                ) : layer.type === "compositor" ? (
                  <CompositorLayerContent
                    layer={layer as CompositorLayer}
                  />
                ) : null}
              </div>
            ))}
          </SidebarContent>
        </Tabs>
      </Sidebar>
    );
  }
);

export default WorkflowRightSidebar;
