"use client";
import WorkflowNumber from "@/frontend/components/node/layouts/Number";
import { CollapsibleContent } from "@/frontend/components/ui/shadcn/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/frontend/components/ui/shadcn/sidebar";
import { Layer, Node } from "@/frontend/types";

export default function ObjectTransformSection({
  layer,
  objects,
}: {
  layer: Layer;
  objects: Node[];
}) {
  return (
    <CollapsibleContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <ul className="flex flex-col gap-[8px]">

                <ul className="flex flex-col gap-[2px]">
                  <li>
                    <WorkflowNumber
                      className="text-foreground"
                      number={Math.round(objects[0].box.position.x)}
                      label="x"
                    />
                  </li>
                  <li>
                    <WorkflowNumber
                      className="text-foreground"
                      number={Math.round(objects[0].box.position.y)}
                      label="y"
                    />
                  </li>
                </ul>
                <ul className="flex gap-[2px] flex-col">
                  <li>
                    <WorkflowNumber
                      className="text-foreground"
                      number={objects[0].box.width ?? 0}
                      label="width"
                    />
                  </li>
                  <li>
                    <WorkflowNumber
                      className="text-foreground"
                      number={objects[0].box.height ?? 0}
                      label="height"
                    />
                  </li>
                </ul>
              </ul>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </CollapsibleContent>
  );
}
