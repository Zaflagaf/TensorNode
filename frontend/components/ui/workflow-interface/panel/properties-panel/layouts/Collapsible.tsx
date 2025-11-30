"use client";

import { ChevronDownIcon, GripVertical } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
} from "@/frontend/components/ui/shadcn/collapsible";
import { CollapsibleTrigger } from "@radix-ui/react-collapsible";
import React from "react";


export default function CollapsibleProperties({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="w-full h-full text-start bg-background py-1 px-2 rounded-xs group justify-between flex">
        <div className="flex items-center text-xxs gap-1">
          <ChevronDownIcon className="text-muted-foreground size-3 transition-transform group-data-[state=open]:rotate-180" />
          {label}
        </div>
        <GripVertical className="size-3 text-muted-foreground cursor-grab" />
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-accent/30">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
