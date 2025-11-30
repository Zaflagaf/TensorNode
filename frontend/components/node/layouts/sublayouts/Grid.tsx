import React from "react";

const WorkflowSubGrid = ({
  children,
  ref,
}: {
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  return (
    <div
      ref={ref}
      className="relative w-full h-full bg-background brightness-125 rounded-xs overflow-visible"
    >
      {/* Damier */}
      <div
        className="absolute inset-0 brightness-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: "10px 10px",
        }}
      />

      {/* Children devant le damier */}
      <div className="relative w-full h-full z-0">{children}</div>
    </div>
  );
};

export default WorkflowSubGrid;
