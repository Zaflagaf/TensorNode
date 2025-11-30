"use client";
import { CollapsibleContent } from "@/frontend/components/ui/shadcn/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/frontend/components/ui/shadcn/sidebar";
import { Layer, Node } from "@/frontend/types";
import React from "react";

export default function ObjectPreviewSection({
  layer,
  objects,
}: {
  layer: Layer;
  objects: Node[];
}) {
  const { inputs, outputs } = objects[0].content.ports;

  return (
    <CollapsibleContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <ul className="flex flex-col gap-[2px]">
                {Object.entries(outputs).map(([key, value]) => {
                  const preview = value.value;
                  return (
                    <React.Fragment key={key}>
                      {preview ? (
                        <li>{preview}</li>
                      ) : (
                        <li> doesn't have preview</li>
                      )}
                    </React.Fragment>
                  );
                })}
              </ul>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </CollapsibleContent>
  );
}
