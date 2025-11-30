"use client";

import React from "react";

const WorkflowDefault = React.memo((props: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className="text-foreground/80 text-xxs px-[2px] py-[2px]" {...props}/>
  );
});
export default WorkflowDefault;
