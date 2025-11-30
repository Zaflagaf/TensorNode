"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/frontend/components/ui/shadcn/sidebar";

import { ModelLayer } from "@/frontend/types";

import CollapsibleProperties from "../../layouts/Collapsible";
import BuildSection from "./BuildSections";
import DownloadSection from "./DownloadSection";
import HistorySection from "./HistorySection";

export default function ModelLayerContent({ layer }: { layer: ModelLayer }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-px">
        <CollapsibleProperties label="Build">
          <BuildSection layer={layer} />
        </CollapsibleProperties>
        <CollapsibleProperties label="History">
          <HistorySection layer={layer} />
        </CollapsibleProperties>
        <CollapsibleProperties label="Download">
          <DownloadSection layer={layer} />
        </CollapsibleProperties>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
