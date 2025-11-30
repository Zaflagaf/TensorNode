import { cn } from "@/frontend/lib/utils";
import React from "react";

export default function WorkflowFreeze({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(!value && "opacity-50 pointer-events-none")}>
      {children}
    </div>
  );
}
