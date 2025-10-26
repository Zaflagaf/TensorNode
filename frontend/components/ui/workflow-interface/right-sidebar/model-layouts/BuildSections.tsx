"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/frontend/components/ui/shadcn/sidebar";

import { Blocks, Check, Cog, LoaderCircle, X } from "lucide-react";

import { useEdgesStore } from "@/frontend/organism/edge/store/edgesStore";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";
import React from "react";
import { Progress } from "../../../shadcn/progress";

import { cn } from "@/frontend/lib/utils";
import { ModelLayerType } from "@/frontend/schemas/layer";
import { ButtonStatus } from "@/frontend/schemas/types/general";
import { buildModel, getModelArchitecture } from "@/frontend/services/api";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { AccordionContent } from "../../../shadcn/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shadcn/table";

import { useLayersStore } from "@/frontend/organism/canvas/store/layersStore";
import { toast } from "sonner";

export default function BuildSection({ layer }: { layer: ModelLayerType }) {
  const [buildProgress, setBuildProgress] = React.useState<number>(0);
  const [outputNodeId, setOutputNodeId] = React.useState<string | undefined>(
    undefined
  );
  const setLayer = useLayersStore((state) => state.actions.addLayer);
  const [architecture, setArchitecture] = React.useState<any>([
    { layer: "N/A", output: "N/A", params: "N/A" },
  ]);
  const [buttonStatus, setButtonStatus] = React.useState<ButtonStatus>("idle");
  const [summary, setSummary] = React.useState<{
    total_params: number;
    trainable_params: number;
    non_trainable_params: number;
  }>({
    total_params: 0,
    trainable_params: 0,
    non_trainable_params: 0,
  });

  React.useEffect(() => {
    const nodeIdArray = layer.content;
    const nodes = useNodesStore.getState().nodes;
    const outputNodeId = nodeIdArray.find(
      (nodeId: string) => nodes[nodeId].type === "output"
    );
    setOutputNodeId(outputNodeId);
  }, [layer.content]);

  const handleBuild = async () => {
    if (!outputNodeId) return;
    setLayer(layer.id, { ...layer, model: outputNodeId });
    setButtonStatus("loading");

    // Build model
    setBuildProgress(0);

    try {
      const nodes = useNodesStore.getState().nodes;
      const edges = useEdgesStore.getState().edges;
      await buildModel(nodes, edges, outputNodeId);
      const { architecture, summary } = await getModelArchitecture(
        outputNodeId
      );
      setSummary(summary);
      setArchitecture(
        architecture.length === 0
          ? [{ layer: "N/A", output: "N/A", params: "N/A" }]
          : architecture
      );
      setBuildProgress(100);
      setButtonStatus("success");
    } catch (err) {
      toast("Model failed", {
        description: "Architecture not valid",
      });
      setButtonStatus("error");
    } finally {
      setTimeout(() => {
        setBuildProgress(0);
        setButtonStatus("idle");
      }, 3000);
    }
  };

  const getTableHeaders = (): string[] => {
    if (architecture.length === 0) return [];
    return Object.keys(architecture[0]);
  };

  return (
    <AccordionContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="bg-input/30 relative overflow-hidden rounded-sm justify-center cursor-pointer z-0 text-xs"
                onClick={handleBuild}
              >
                <Progress
                  value={buildProgress}
                  className="absolute w-full h-full rounded-sm bg-transparent -z-1"
                  classNameSecondary={cn(
                    buttonStatus === "success"
                      ? "bg-hue-150"
                      : buttonStatus === "loading"
                      ? "bg-hue-260"
                      : buttonStatus === "error"
                      ? "bg-hue-30"
                      : null
                  )}
                />
                <Blocks /> Buid {layer.name}{" "}
                {buttonStatus === "success" ? (
                  <Check />
                ) : buttonStatus === "loading" ? (
                  <LoaderCircle className="animate-spin" />
                ) : buttonStatus === "error" ? (
                  <X />
                ) : null}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              {
                /* TABLE */
                <ScrollArea className="flex max-w-full max-h-64 undraggable outline outline-border overflow-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {getTableHeaders().map((header) => (
                          <TableHead
                            key={header}
                            className="font-semibold bg-muted-foreground/5 text-xs"
                          >
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {architecture.map((row: any, index: any) => (
                        <TableRow key={index}>
                          {getTableHeaders().map((header) => (
                            <TableCell key={header} className="text-xs">
                              {row[header]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              }
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="text-muted-foreground text-xs">
                <span className="text-foreground">Params:</span>
                <div className="flex items-center gap-2 py-[0.125rem]">
                  <Cog className="w-4" /> Total:{" "}
                  {summary?.total_params ?? "N/A"}
                </div>
                <div className="flex items-center gap-2 py-[0.125rem]">
                  <Cog className="w-4" /> Trainable:{" "}
                  {summary?.trainable_params ?? "N/A"}
                </div>
                <div className="flex items-center gap-2 py-[0.125rem]">
                  <Cog className="w-4" /> Non-trainable:{" "}
                  {summary?.non_trainable_params ?? "N/A"}
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </AccordionContent>
  );
}
