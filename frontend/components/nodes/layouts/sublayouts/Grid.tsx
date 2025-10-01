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
      className="relative w-full h-full my-2 bg-node-vz rounded-[4px]  outline-node-vz-outline outline overflow-hidden"
    >
      {/* Damier */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--color-node-vz-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-node-vz-line) 1px, transparent 1px)
          `,
          backgroundSize: "10px 10px",
        }}
      />

      {/* Children devant le damier */}
      <div className="relative w-full h-full">{children}</div>
    </div>
  );
};

export default WorkflowSubGrid;
