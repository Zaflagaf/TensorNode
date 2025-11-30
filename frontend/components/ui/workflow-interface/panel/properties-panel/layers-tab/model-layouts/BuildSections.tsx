"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/frontend/components/ui/shadcn/sidebar";
import { Cog } from "lucide-react";
import { useEdgesStore } from "@/frontend/store/edgesStore";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { useLayersStore } from "@/frontend/store/layersStore";
import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/shadcn/table";
import { buildModel, getModelArchitecture } from "@/frontend/lib/fetch/api";
import { ButtonStatus, ModelLayer } from "@/frontend/types";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { CollapsibleContent } from "@/frontend/components/ui/shadcn/collapsible";
import { generateId } from "@/frontend/lib/generateId";
import { toastError } from "../../../../general/primitives/toast";
import ButtonProperties from "../../layouts/Button";

export default function BuildSection({ layer }: { layer: ModelLayer }) {
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  const setLayerAttribute = useLayersStore(
    (state) => state.actions.setLayerAttribute
  );
  const [buildProgress, setBuildProgress] = React.useState<number>(0);
  const [outputNodeId, setOutputNodeId] = React.useState<string | undefined>(
    undefined
  );
  const [architecture, setArchitecture] = React.useState<any>([]);
  const [buttonStatus, setButtonStatus] = React.useState<ButtonStatus>(
    ButtonStatus.idle
  );
  const [summary, setSummary] = React.useState<{
    total_params: number;
    trainable_params: number;
    non_trainable_params: number;
  }>({ total_params: 0, trainable_params: 0, non_trainable_params: 0 });

  const localStorageKey = `layer-${layer.id}-architecture`;

  // Load persisted architecture on mount
  useEffect(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setArchitecture(parsed.architecture ?? []);
      setSummary(parsed.summary ?? { total_params: 0, trainable_params: 0, non_trainable_params: 0 });
    }

    const nodeIdArray = layer.content;
    const nodes = useNodesStore.getState().nodes;
    const outputNodeId = nodeIdArray.find(
      (nodeId: string) => nodes[nodeId].type === "output"
    );
    setOutputNodeId(outputNodeId);
  }, [layer.content, localStorageKey]);

  const handleBuild = async () => {
    if (!outputNodeId) return;
    setLayerAttribute(layer.id, "model", outputNodeId);
    setButtonStatus(ButtonStatus.loading);
    setBuildProgress(0);

    try {
      const nodes = useNodesStore.getState().nodes;
      const edges = useEdgesStore.getState().edges;
      const modelName = layer.name;

      await buildModel(nodes, edges, outputNodeId, modelName);
      const { architecture, summary } = await getModelArchitecture(outputNodeId);

      setArchitecture(
        architecture.length === 0
          ? [{ layer: "N/A", output: "N/A", params: "N/A" }]
          : architecture
      );
      setSummary(summary);

      setBuildProgress(100);
      setButtonStatus(ButtonStatus.success);

      const buildId = generateId();
      setNodeOutput(outputNodeId, "in-buildId", buildId);

      // Persist in localStorage
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({ architecture, summary, buildId })
      );
    } catch (err) {
      toastError({
        title: "Failed to build",
        description: `'${layer.name}' architecture not valid`,
      });
      setButtonStatus(ButtonStatus.error);
    } finally {
      setTimeout(() => {
        setBuildProgress(0);
        setButtonStatus(ButtonStatus.idle);
      }, 3000);
    }
  };

  const getTableHeaders = (): string[] => {
    if (architecture.length === 0) return [];
    return Object.keys(architecture[0]);
  };

  return (
    <CollapsibleContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <ButtonProperties
                label={`Build ${layer.name}`}
                onClick={handleBuild}
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <ScrollArea className="flex max-w-full max-h-64 rounded-xs outline outline-border overflow-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {getTableHeaders().map((header) => (
                        <TableHead
                          key={header}
                          className="bg-muted-foreground/5 text-xxs h-6"
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
                          <TableCell key={header} className="text-xxs">
                            {row[header]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="text-muted-foreground text-xxs">
                <div className="flex items-center gap-2 py-1">
                  <Cog className="size-3" /> Total params:{" "}
                  {summary?.total_params ?? "N/A"}
                </div>
                <div className="flex items-center gap-2 py-[0.125rem]">
                  <Cog className="size-3" /> Trainable params:{" "}
                  {summary?.trainable_params ?? "N/A"}
                </div>
                <div className="flex items-center gap-2 py-[0.125rem]">
                  <Cog className="size-3" /> Non-trainable params:{" "}
                  {summary?.non_trainable_params ?? "N/A"}
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </CollapsibleContent>
  );
}
