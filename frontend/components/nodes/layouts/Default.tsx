"use client";

import React from "react";

const WorkflowDefault = React.memo(({ label }: { label: string }) => {
  return (
    <p className="text-foreground/80 text-xs px-[2px] py-[4px]">{label}</p>
  );
});
export default WorkflowDefault;
