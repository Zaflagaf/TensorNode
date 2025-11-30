"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/frontend/components/ui/shadcn/sidebar";

import { useNodesStore } from "@/frontend/store/nodesStore";
import { ModelLayer, Node } from "@/frontend/types";
import * as Icons from "lucide-react";
import { useEffect, useState } from "react";
import CollapsibleProperties from "../layouts/Collapsible";
import ObjectPreviewSection from "./ObjectPreview";
import ObjectTransformSection from "./ObjectTransformSection";

function TopSection({ objects }: { objects: Node[] }) {
  const IconComponent = objects[0].content.icon
    ? Icons[objects[0].content.icon]
    : Icons.Component;
  return (
    <div className="text-xxs pb-2">
      <div className="flex gap-[4px] items-center text-foreground">
        <IconComponent className="size-3" /> {objects[0].content.name}
      </div>
      <div className="text-muted-foreground">
        {objects[0].type} : {objects[0].content.description}
      </div>
    </div>
  );
}

export default function ObjectContent({ layer }: { layer: ModelLayer }) {
  const selectedNodes = useNodesStore((state) => state.selectedNodes);
  const nodes = useNodesStore((state) => state.nodes);
  const [objects, setObjects] = useState<Node[]>([]);

  useEffect(() => {
    const selected = Object.entries(nodes)
      .filter(([key]) => selectedNodes.includes(key))
      .map(([_, value]) => value);

    setObjects(selected);
  }, [selectedNodes, nodes]);

  return (
    <SidebarGroup>
      {objects.length > 0 ? (
        <SidebarGroupContent className="flex flex-col gap-px">
          <TopSection objects={objects} />
          <CollapsibleProperties label="Preview">
            <ObjectPreviewSection layer={layer} objects={objects} />
          </CollapsibleProperties>
          <CollapsibleProperties label="Transform">
            <ObjectTransformSection layer={layer} objects={objects} />
          </CollapsibleProperties>
        </SidebarGroupContent>
      ) : (
        <p className="text-muted-foreground text-xxs">No node selected</p>
      )}
    </SidebarGroup>
  );
}
