"use client";

import { cn } from "@/frontend/lib/utils";
import { useLayersStore } from "@/frontend/organism/canvas/store/layersStore";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../../shadcn/tabs";

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
      className="w-[100px] rounded-none flex items-center justify-between text-xs truncate group cursor-pointer border-0 border-r-1 border-border"
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
        <X className="w-4 h-4" />
      </span>
    </TabsTrigger>
  );
};

export default function TopTabs() {
  const currentLayer = useLayersStore((state) => state.currentLayer) || "";
  const setCurrentLayer = useLayersStore(
    (state) => state.actions.setCurrentLayer
  );
  const layers = useLayersStore((state) => state.layers);

  const [tabsData, setTabsData] = useState<{ name: string; id: string }[]>([]);

  // Ajouter ou mettre à jour un onglet
  useEffect(() => {
    if (!currentLayer || !layers[currentLayer]?.name) return;
    const name = layers[currentLayer].name;

    setTabsData((prev) => {
      const exists = prev.find((tab) => tab.id === currentLayer);
      if (exists) {
        return prev.map((tab) =>
          tab.id === currentLayer ? { ...tab, name } : tab
        );
      } else {
        return [...prev, { name, id: currentLayer }];
      }
    });
  }, [currentLayer, layers]);

  const [layerToActivate, setLayerToActivate] = useState<string | null>(null);

  const removeTab = (layerId: string) => {
    setTabsData((prev) => {
      const updated = prev.filter((tab) => tab.id !== layerId);

      // On mémorise la prochaine couche à activer
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
      <TabsList className="bg-transparent flex p-0 border-collapse">
        {tabsData.map((obj) => (
          <TopTabsTrigger key={obj.id} value={obj.id} removeTab={removeTab}>
            {obj.name}
          </TopTabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
