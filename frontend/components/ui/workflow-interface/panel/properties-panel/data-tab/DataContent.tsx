"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/frontend/components/ui/shadcn/sidebar";

import { ModelLayer } from "@/frontend/types";
import CollapsibleProperties from "../layouts/Collapsible";
import DataLoaderSection from "./DataLoaderSection";

export default function DataContent({ layer }: { layer: ModelLayer }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-px">
        <CollapsibleProperties label="Datasets">
          <DataLoaderSection layer={layer} />
        </CollapsibleProperties>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
