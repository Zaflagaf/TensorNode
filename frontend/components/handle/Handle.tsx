"use client";

import { motion } from "framer-motion";
import React, { useEffect, useMemo, useRef } from "react";
import { typeColors } from "../../config/data/data";
import useMouseEvent from "../../hooks/useMouse";
import { cn } from "../../lib/utils";
import { usePendingEdgeStore } from "../../store/pendingEdgeStore";
import { useWorkflowStore } from "../../store/workflowStore";
import { HandleComponent } from "../../types/handle";

/* const ValueToolTip = ({
  isHovered,
  value,
}: {
  isHovered: boolean;
  value: any;
}) => (
  
  <div
    className={cn(
      "absolute top-[-10px] left-5 bg-neutral-800/80 text-white px-5 py-1 rounded-md pointer-events-none transition duration-250",
      isHovered ? "opacity-100" : "opacity-0"
    )}
  >
    {JSON.stringify(value)}
  </div>
); */

const WorkflowHandle: React.FC<HandleComponent> = React.memo(
  ({ children, type, handleId, node }) => {
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const handleSize = 10,
      borderRadius = 5;

    const { workflow } = useWorkflowStore();
    const { setPendingEdge } = usePendingEdgeStore((s) => s.actions);
    const { state, handlers } = useMouseEvent({
      enter: true,
      leave: true,
      down: true,
      up: true,
    });

    const handleType = useMemo(() => {
      const port =
        node.content.ports[type === "source" ? "outputs" : "inputs"][handleId];
      return port?.type ?? "default";
    }, [node, handleId, type]);

    useEffect(() => {
      nodeRef.current = document.getElementById(
        node.id
      ) as HTMLDivElement | null;
    }, [workflow, node.id]);

    useEffect(() => {
      if (state.isDown) setPendingEdge({ handleId, nodeId: node.id });
    }, [state.isDown, setPendingEdge, handleId, node.id]);

    const bg = typeColors[handleType];
    const value =
      node.content.ports[type === "target" ? "inputs" : "outputs"][handleId]
        ?.value;

    const pos = {
      left:
        type === "target"
          ? `calc(0% - ${handleSize / 2 + 10}px)`
          : `calc(100% - ${handleSize / 2 - 10}px)`,
      top: `calc(50% - ${handleSize / 2}px)`,
    };

    return (
      <div className="relative flex w-full z-0">
        <div className="absolute" style={pos}>
          <div
            id={handleId}
            {...handlers}
            data-handle={JSON.stringify({
              id: handleId,
              nodeId: node.id,
              type,
            })}
            className="relative flex items-center justify-center pointer-events-auto handle undraggable"
            style={{
              width: handleSize,
              height: handleSize,
              borderRadius,
              backgroundColor: bg,
            }}
          >
            {/* <ValueToolTip isHovered={state.isHover} value={value} /> */}
            <motion.div
              className="absolute w-6 h-6 rounded-full pointer-events-none"
              style={{ outline: `2px solid ${bg}` }}
              initial={{ scale: 0 }}
              animate={{ scale: state.isHover ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <div className="absolute w-6 h-6 rounded-full clip-handle" />
          </div>
        </div>

        <div
          className={cn(
            "w-full flex items-center",
            type === "source" ? "justify-end" : "justify-start"
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

export default WorkflowHandle;
