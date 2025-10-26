"use client";
import { Download, Layers2, Network, Package, Plus } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/frontend/components/ui/shadcn/sidebar";
import { cn } from "@/frontend/lib/utils";
import { useLayersStore } from "@/frontend/organism/canvas/store/layersStore";
import { useWorkflowStore } from "@/frontend/organism/canvas/store/workflowStore";
import { useZoomStore } from "@/frontend/organism/canvas/store/zoomStore";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../shadcn/hover-card";

import { useEdgesStore } from "@/frontend/organism/edge/store/edgesStore";
import { Layer } from "@/frontend/types";
import { ContextMenu } from "@radix-ui/react-context-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { produce } from "immer";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../shadcn/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../shadcn/dropdown-menu";
import { Input } from "../../shadcn/input";
import { Separator } from "../../shadcn/separator";

const WorkflowLeftSidebar = React.memo(
  ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const layers = useLayersStore((state) => state.layers);
    const currentLayer = useLayersStore((state) => state.currentLayer);
    const setLayers = useLayersStore((state) => state.actions.setLayers);
    const setCurrentLayer = useLayersStore(
      (state) => state.actions.setCurrentLayer
    );
    const addLayer = useLayersStore((state) => state.actions.addLayer);
    const nodes = useNodesStore((state) => state.nodes);
    const focusIs = useZoomStore((state) => state.actions.focusId);
    const workflow = useWorkflowStore((state) => state.workflow);

    const handleSubClick = (layerId: string, nodeId: string) => {
      setCurrentLayer(layerId);
      setTimeout(() => {
        focusIs(nodeId, workflow.current);
      }, 0);
    };

    const [renameId, setRenameId] = React.useState<string | null>(null);
    const [renameValue, setRenameValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (renameId && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [renameId]);

    const handleDoubleClick = (layer: Layer) => {
      setRenameId(layer.id);
      setRenameValue(layer.name);
    };

    const saveRename = () => {
      if (renameId && renameValue.trim()) {
        setLayers(
          produce(layers, (draft) => {
            draft[renameId].name = renameValue;
          })
        );
      }
      setRenameId(null);
      setRenameValue("");
    };

    const cancelRename = () => {
      setRenameId(null);
      setRenameValue("");
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveRename();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelRename();
      }
    };

    const handleDownloadWorkflow = () => {
      const nodes = useNodesStore.getState().nodes;
      const edges = useEdgesStore.getState().edges;
      const layers = useLayersStore.getState().layers;
      const file = JSON.stringify(
        {
          metadata: {
            date: "21/12/07",
          },
          workflow: {
            nodes: nodes,
            edges: edges,
            layers: layers,

            currentLayer: currentLayer,
          },
        },
        null,
        2
      );

      const blob = new Blob([file], { type: "application/json" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      (a.href = url), (a.download = "project.json");
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <Sidebar
        {...props}
        collapsible="none"
        className="h-[100svh] border-r border-r-sidebar-border"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs inline-flex gap-1">
              <span className="w-3 h-3 bg-muted-foreground rounded-xs" />
              <span>Tensornode 4.0</span>
            </SidebarGroupLabel>
            <SidebarGroupAction className="cursor-pointer">
              <Download onClick={() => handleDownloadWorkflow()} />
            </SidebarGroupAction>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs ">
              <span>Layers</span>

              {
                <HoverCard>
                  <SidebarGroupAction>
                    {
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <HoverCardTrigger>
                            <Plus className="w-4" />
                          </HoverCardTrigger>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="hover:bg-accent rounded-xs px-1 py-[0.125rem] cursor-pointer"
                            onClick={() => {
                              const prefix = "l";
                              const id = `${prefix}-${Math.random()
                                .toString(36)
                                .substr(2, 9)}`;

                              const layer = {
                                id: id,
                                name: "Model",
                                type: "model",
                                content: [],
                                transform: { x: 0, y: 0, k: 0 },
                              };

                              addLayer(id, layer);
                            }}
                          >
                            Model
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-accent rounded-xs px-1 py-[0.125rem] cursor-pointer"
                            onClick={() => {
                              const prefix = "l";
                              const id = `${prefix}-${Math.random()
                                .toString(36)
                                .substr(2, 9)}`;

                              const layer = {
                                id: id,
                                name: "Compositor",
                                type: "compositor",
                                content: [],
                                transform: { x: 0, y: 0, k: 0 },
                              };

                              addLayer(id, layer);
                            }}
                          >
                            Compositor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    }
                  </SidebarGroupAction>
                  <HoverCardContent className="w-fit h-fit px-2 py-1">
                    Add a layer
                  </HoverCardContent>
                </HoverCard>
              }
            </SidebarGroupLabel>

            <SidebarMenu>
              {layers &&
                Object.values(layers).map((layer, key) => (
                  <ContextMenu key={key}>
                    <ContextMenuTrigger>
                      <SidebarMenuItem
                        className={cn(
                          "rounded-md",
                          currentLayer === layer.id && ""
                        )}
                      >
                        <SidebarMenuButton
                          className={cn(
                            "text-xs",
                            layer.id === currentLayer &&
                              "hover:bg-accent-foreground text-background hover:text-background bg-accent-foreground/90 active:bg-foreground active:text-background"
                          )}
                          onClick={() => setCurrentLayer(layer.id)}
                          onDoubleClick={() => handleDoubleClick(layer)}
                        >
                          {layer.type === "compositor" ? (
                            <Package className="h-4 w-4" />
                          ) : layer.type === "model" ? (
                            <Network className="h-4 w-4" />
                          ) : null}
                          {renameId === layer.id ? (
                            <Input
                              ref={inputRef}
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onKeyDown={handleRenameKeyDown}
                              onBlur={saveRename}
                              className="h-6 text-xs px-2 py-0 focus-visible:ring-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span>{layer.name}</span>
                          )}
                        </SidebarMenuButton>
                        <>
                          {/*                     {layer.content?.length ? (
                      <SidebarMenuSub> */}
                          {/*                         {layer.content.map((nodeId, key) => (
                          <SidebarMenuSubItem key={key}>
                            <SidebarMenuButton
                              className={cn(
                                "cursor-pointer text-xs",
                                currentLayer === layer.id &&
                                  "hover:bg-selected/30 active:bg-selected/50"
                              )}
                              onClick={(e) => {
                                e.preventDefault();
                                handleSubClick(layer.id, nodeId);
                              }}
                            >
                              {nodes[nodeId]?.content?.name ||
                                nodes[nodeId]?.type}
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        ))} */}

                          {/*                         <Accordion
                          type="multiple"
                          className="w-full space-y-1 px-2"
                        >
                          {layer.content.map((nodeId, key) => (
                            <AccordionItem
                              key={key}
                              value={nodeId}
                              className="border rounded-lg px-2"
                            >
                              <AccordionTrigger className="text-xs font-medium py-2">
                                <div className="flex items-center gap-2">
                                  <Layers2 className="h-4 w-4" />
                                  <span>
                                    {nodes[nodeId]?.content?.name ||
                                      nodes[nodeId]?.type}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="space-y-2 text-[11px] pb-2">
                                <div>
                                  <p className="font-semibold text-muted-foreground">
                                    Type:
                                  </p>
                                  <p className="pl-2">{nodes[nodeId]?.type}</p>
                                </div>

                                <Separator className="my-1" />

                                <div>
                                  <p className="font-semibold text-muted-foreground">
                                    Inputs:
                                  </p>
                                  <div className="space-y-0.5 pl-2">
                                    {nodes[nodeId]?.content?.ports?.inputs &&
                                      Object.values(
                                        nodes[nodeId].content.ports.inputs
                                      ).map((handle: any, key) => (
                                        <div
                                          key={key}
                                          className="flex justify-between text-[10px]"
                                        >
                                          <span className="font-medium">
                                            {handle.port}
                                          </span>
                                          <span className="text-muted-foreground truncate max-w-[100px] text-right">
                                            {JSON.stringify(handle.value)}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>

                                <div>
                                  <p className="font-semibold text-muted-foreground">
                                    Outputs:
                                  </p>
                                  <div className="space-y-0.5 pl-2">
                                    {nodes[nodeId]?.content?.ports?.outputs &&
                                      Object.values(
                                        nodes[nodeId].content.ports.outputs
                                      ).map((handle: any, key) => (
                                        <div
                                          key={key}
                                          className="flex justify-between text-[10px]"
                                        >
                                          <span className="font-medium">
                                            {handle.port}
                                          </span>
                                          <span className="text-muted-foreground truncate max-w-[100px] text-right">
                                            {handle.value === "" ||
                                            handle.value == null ||
                                            (Array.isArray(handle.value) &&
                                              handle.value.length === 0) ||
                                            (typeof handle.value === "object" &&
                                              !Array.isArray(handle.value) &&
                                              handle.value !== null &&
                                              Object.keys(handle.value)
                                                .length === 0)
                                              ? "N/A"
                                              : JSON.stringify(handle.value)}
                                          </span>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion> */}
                          {/*                       </SidebarMenuSub>
                    ) : null} */}
                        </>
                      </SidebarMenuItem>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem>Rename</ContextMenuItem>
                      <ContextMenuItem>Delete</ContextMenuItem>
                      <ContextMenuItem>Open</ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
            </SidebarMenu>
          </SidebarGroup>
          <Separator className="dark:w-[90%] mx-auto" />
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs">Nodes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {currentLayer &&
                  layers[currentLayer].content.map((nodeId, key) => (
                    <SidebarMenuItem key={key}>
                      <SidebarMenuButton
                        className={cn("cursor-pointer text-xs")}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSubClick(layers[currentLayer].id, nodeId);
                        }}
                      >
                        <Layers2 />
                        {nodes[nodeId]?.content?.name || nodes[nodeId]?.type}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }
);

WorkflowLeftSidebar.displayName = "WorkflowLeftSidebar";

export default WorkflowLeftSidebar;
