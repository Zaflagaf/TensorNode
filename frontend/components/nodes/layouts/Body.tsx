import React from "react";

const WorkflowBody = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="flex flex-col px-[10px] py-[8px] gap-[2px]">
        {children}
      </div>
    );
  }
);

export default WorkflowBody;
