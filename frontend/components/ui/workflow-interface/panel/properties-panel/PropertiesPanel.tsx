"use client";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
} from "@/frontend/components/ui/shadcn/sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/frontend/components/ui/shadcn/tabs";

import { findLayer, useLayersStore } from "@/frontend/store/layersStore";
import { Component, Database, Layers } from "lucide-react";

import { cn } from "@/frontend/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/frontend/components/ui/shadcn/tooltip";
import { CompositorLayer, Layer, ModelLayer } from "@/frontend/types";
import DataContent from "./data-tab/DataContent";
import CompositorLayerContent from "./layers-tab/compositor-layouts/CompositorContent";
import ModelLayerContent from "./layers-tab/model-layouts/ModelContent";
import ObjectContent from "./object-tab/ObjectContent";

const tabs = [
  {
    id: "layer",
    name: "Layer",
    description: "Layer Properties",
    icon: Layers,
    color: "!bg-hue-250",
  },
  {
    id: "object",
    name: "Object",
    description: "Object Properties",
    icon: Component,
    color: "!bg-hue-0",
  },
  {
    id: "data",
    name: "Data",
    description: "Data Properties",
    icon: Database,
    color: "!bg-hue-100",
  },
];

const WorkflowPropertiesPanel = React.memo(
  ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const currentLayerId = useLayersStore((state) => state.currentLayer);
    const layers = useLayersStore((state) => state.layers);
    const currentLayer = findLayer(layers, currentLayerId);
    const [activeTab, setActiveTab] = React.useState("layer");

    return (
      <Sidebar
        {...props}
        collapsible="none"
        side="right"
        className="h-full w-full overflow-scroll border-l border-sidebar-border"
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex h-full"
        >
          <SidebarContent className="!flex !flex-row h-full gap-0">
            <TabsList className="flex flex-col h-full w-fit justify-start rounded-none p-0 bg-background">
              <TabsList className="flex flex-col w-fit h-fit rounded-none gap-0.5 p-0 bg-background">
                {Object.values(tabs).map((tab) => (
                  <Tooltip key={tab.id}>
                    <TabsTrigger
                      value={tab.id}
                      className={`w-5 h-5 aspect-square p-3 rounded-[4px_0_0_4px] data-[state=active]:brightness-100 brightness-50 data-[state=active]:!border-transparent pointer-events-auto `}
                      asChild
                    >
                      <TooltipTrigger>
                        <tab.icon className={cn(`size-3`)} />
                      </TooltipTrigger>
                    </TabsTrigger>

                    <TooltipContent
                      side="left" // position à droite du trigger
                      sideOffset={2} // écart avec le trigger
                      align="center" // centré verticalement
                      className="pointer-events-none" // empêche l'hover sur le tooltip
                    >
                      <p className="text-foreground text-xxs">{tab.name}</p>
                      <p className="text-muted-foreground text-xxs">
                        {tab.description}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TabsList>
            </TabsList>

            <div className="w-full h-full overflow-auto">
              <TabsContent value={"layer"}>
                {currentLayer && (
                  <div key={currentLayer.id} className="block">
                    {currentLayer.type === "model" ? (
                      <ModelLayerContent layer={currentLayer as ModelLayer} />
                    ) : currentLayer.type === "compositor" ? (
                      <CompositorLayerContent
                        layer={currentLayer as CompositorLayer}
                      />
                    ) : null}
                  </div>
                )}
              </TabsContent>
              <TabsContent value={"object"}>
                <ObjectContent layer={currentLayer as Layer} />
              </TabsContent>
              <TabsContent value={"data"}>
                <DataContent layer={currentLayer as Layer} />
              </TabsContent>
            </div>
          </SidebarContent>
        </Tabs>
      </Sidebar>
    );
  }
);

export default WorkflowPropertiesPanel;
