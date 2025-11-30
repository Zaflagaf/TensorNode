"use client";

import { cn } from "@/frontend/lib/utils";
import { useLayersStore } from "@/frontend/store/layersStore";
import { Layer } from "@/frontend/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../../../shadcn/tabs";

const TopTabsTrigger = ({
  value,
  removeTab,
  children,
}: {
  value: string;
  removeTab: (layerId: string) => void;
  children: React.ReactNode;
}) => {
  const setCurrentLayer = useLayersStore(
    (state) => state.actions.setCurrentLayer
  );

  return (
    <TabsTrigger
      value={value}
      className="w-20 rounded-none flex items-center justify-between text-xxs truncate group cursor-pointer border-0 border-r-1 border-border"
      onClick={() => setCurrentLayer(value)}
    >
      <span className="truncate">{children}</span>
      <span
        onClick={(e) => {
          e.stopPropagation();
          removeTab(value);
        }}
        className={cn(
          "flex-shrink-0 ml-2 hidden group-hover:block cursor-pointer rounded-xs hover:bg-accent"
        )}
      >
        <X className="size-3" />
      </span>
    </TabsTrigger>
  );
};

// Fonction récursive pour chercher un layer par ID dans l'arborescence
function findLayerById(layers: Layer[], id: string): Layer | undefined {
  for (const layer of layers) {
    if (layer.id === id) return layer;
    if (layer.children) {
      const found = findLayerById(layer.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export default function TopTabs() {
  const currentLayer = useLayersStore((state) => state.currentLayer) || "";
  const setCurrentLayer = useLayersStore(
    (state) => state.actions.setCurrentLayer
  );
  const layers = useLayersStore((state) => state.layers); // Layer[]

  const [tabsData, setTabsData] = useState<{ name: string; id: string }[]>([]);

  // Ajouter ou mettre à jour un onglet
  useEffect(() => {
    if (!currentLayer) return;
    const layer = findLayerById(layers, currentLayer);
    if (!layer) return;

    setTabsData((prev) => {
      const exists = prev.find((tab) => tab.id === currentLayer);
      if (exists) {
        return prev.map((tab) =>
          tab.id === currentLayer ? { ...tab, name: layer.name } : tab
        );
      } else {
        return [...prev, { name: layer.name, id: currentLayer }];
      }
    });
  }, [currentLayer, layers]);

  const [layerToActivate, setLayerToActivate] = useState<string | null>(null);

  const removeTab = (layerId: string) => {
    setTabsData((prev) => {
      const updated = prev.filter((tab) => tab.id !== layerId);

      if (layerId === currentLayer) {
        const nextLayer = updated.length ? updated[updated.length - 1].id : "";
        setLayerToActivate(nextLayer);
      }

      return updated;
    });
  };

  // Effet pour activer la couche après le rendu
  useEffect(() => {
    if (layerToActivate !== null) {
      setCurrentLayer(layerToActivate);
      setLayerToActivate(null);
    }
  }, [layerToActivate, setCurrentLayer]);

  return (
    <Tabs
      className="bg-background border"
      value={currentLayer} // toujours défini
      onValueChange={setCurrentLayer}
    >
      <TabsList className="bg-transparent flex p-0 h-7 border-collapse">
        {tabsData.map((obj) => (
          <TopTabsTrigger key={obj.id} value={obj.id} removeTab={removeTab}>
            {obj.name}
          </TopTabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
