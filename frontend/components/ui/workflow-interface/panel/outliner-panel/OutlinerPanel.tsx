"use client";

import { cn } from "@/frontend/lib/utils";
import { useLayersStore } from "@/frontend/store/layersStore";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { Layer } from "@/frontend/types";

import { Archive, ChevronDown, ChevronRight, Layers2 } from "lucide-react";
import { memo } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/shallow";

const OutlinerTree = memo(
  ({
    layers,
    level = 0,
    rowIndexRef = { current: 0 },
  }: {
    layers: Layer[];
    level?: number;
    rowIndexRef?: { current: number };
  }) => {
    const nodesStore = useNodesStore((state) => state.nodes);
    const currentLayer = useLayersStore((state) => state.currentLayer);
    const setCurrentLayer = useLayersStore(
      (state) => state.actions.setCurrentLayer
    );
    const { openMap } = useOutlinerStore(
      useShallow((state) => ({
        openMap: state.openMap,
      }))
    );
    const tabulation = 30;

    const handleClick = (layerId: string) => {
      setCurrentLayer(layerId);
    };

    return (
      <ul className="text-xxs">
        {layers.map((layer) => {
          const isLayer = layer.type !== "node";
          const hasChildren =
            (layer.children && layer.children.length > 0) ||
            (layer.content && layer.content.length > 0);
          const open = openMap[layer.id] ?? true;

          // Incrémenté une seule fois par ligne réelle
          const colorIndex = rowIndexRef.current;
          rowIndexRef.current += 1;
          const layerColor =
            colorIndex % 2 === 0 ? "bg-neutral-900/50" : "bg-neutral-950";

          return (
            <li key={layer.id}>
              <div
                className={cn(
                  "py-1 flex items-center gap-1 cursor-pointer truncate hover:bg-accent",
                  layerColor,
                  currentLayer === layer.id &&
                    "bg-foreground/90 text-background hover:bg-foreground/90"
                )}
                style={{ paddingLeft: level * tabulation }}
                onClick={() => handleClick(layer.id)}
              >
                {hasChildren && (
                  <span
                    className="size-3 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      hasChildren &&
                        useOutlinerStore.setState((state) => ({
                          openMap: {
                            ...state.openMap,
                            [layer.id]: !open,
                          },
                        }));
                    }}
                  >
                    {open ? (
                      <ChevronDown className="size-3" />
                    ) : (
                      <ChevronRight className="size-3" />
                    )}
                  </span>
                )}
                {!hasChildren && <span className="size-3 flex-shrink-0" />}
                {isLayer ? (
                  <Archive className="w-3 h-3" />
                ) : (
                  <Layers2 className="w-3 h-3" />
                )}
                <span>{layer.name}</span>
              </div>

              {hasChildren && open && (
                <>
                  {/* Nodes / content */}
                  {layer.content &&
                    layer.content.length > 0 &&
                    layer.content.map((nodeId) => {
                      const node = nodesStore[nodeId];
                      if (!node) return null;

                      const nodeIndex = rowIndexRef.current;
                      rowIndexRef.current += 1;
                      const nodeColor =
                        nodeIndex % 2 === 0
                          ? "bg-neutral-900/50"
                          : "bg-neutral-950";

                      return (
                        <div
                          key={`${layer.id}-${nodeId}`}
                          className={cn(
                            "py-1 flex items-center gap-1 truncate",
                            nodeColor
                          )}
                          style={{ paddingLeft: (level + 1) * tabulation }}
                        >
                          <span>{node.content.name}</span>
                        </div>
                      );
                    })}

                  {/* Enfants récursifs */}
                  {layer.children && layer.children.length > 0 && (
                    <OutlinerTree
                      layers={layer.children}
                      level={level + 1}
                      rowIndexRef={rowIndexRef}
                    />
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
    );
  }
);

interface OutlinerStore {
  openMap: Record<string, boolean>;
}

const useOutlinerStore = create<OutlinerStore>(() => ({
  openMap: {},
}));

const WorkflowOutlinerPanel = memo(() => {
  const layers = useLayersStore((state) => state.layers);

  return (
    <div className="pt-2">
      <OutlinerTree layers={layers} />
    </div>
  );
});

export default WorkflowOutlinerPanel;