"use client";

import { useLayersStore } from "@/frontend/store/layersStore";
import { createId } from "@/frontend/utils/create/createId";
import { Plus } from "lucide-react";
import DropdownMenu from "../../general/DropdownMenu";

export default function WorkflowOutlinerHeader() {
  const addLayer = useLayersStore((state) => state.actions.addLayer);

  const handleAddLayer = (type: "model" | "compositor" | string) => {
    const id = createId();
    const layer = {
      id: id,
      name: type,
      type: type.toLowerCase(),
      content: [],
      transform: { x: 0, y: 0, k: 0.5 },
    };

    addLayer(layer);
  };

  return (
    <div className="w-full flex justify-end items-center pr-1 h-full">
      <DropdownMenu
        menuItems={[
          { name: "Compositor", onClick: () => handleAddLayer("Compositor") },
          { name: "Model", onClick: () => handleAddLayer("Model") },
        ]}
      >
        <div className="text-xxs cursor-pointer">
          <Plus className="size-3" />
        </div>
      </DropdownMenu>
    </div>
  );
}
