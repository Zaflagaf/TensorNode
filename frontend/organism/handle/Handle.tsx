"use client";

import { motion } from "framer-motion";
import React, { useEffect, useMemo, useRef } from "react";
import { typeColors } from "../../config/data/data";
import useMouseEvent from "../../hooks/useMouse";
import { cn } from "../../lib/utils";
import { useWorkflowStore } from "../canvas/store/workflowStore";
import { Node } from "../node/types";
import { usePendingEdgeStore } from "../pending-edge/store/pendingEdgeStore";

interface ValueToolTipProps {
  isHovered: boolean;
  value: any;
}

const ValueToolTip: React.FC<ValueToolTipProps> = ({ isHovered, value }) => (
  <div
    className={cn(
      "absolute top-[-10px] left-5 bg-neutral-800/80 transition duration-250 text-white px-5 py-1 rounded-md pointer-events-none",
      isHovered ? "opacity-100" : "opacity-0"
    )}
  >
    {JSON.stringify(value)}
  </div>
);

interface WorkflowHandleProps {
  children: React.ReactNode;
  type: "source" | "target";
  handleId: string;
  port?: string;
  node: Node;
}

const WorkflowHandle: React.FC<WorkflowHandleProps> = React.memo(
  ({ children, type, handleId, node }) => {
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const handleRef = useRef<HTMLDivElement | null>(null);

    const handleSize = 10;
    const borderRadius = 5;

    const workflow = useWorkflowStore((state) => state.workflow);
    const setPendingEdge = usePendingEdgeStore(
      (state) => state.actions.setPendingEdge
    );

    // Déterminer le type du handle pour la couleur
    const handleType = useMemo(() => {
      const handle =
        type === "source"
          ? node.content.ports.outputs[handleId]
          : node.content.ports.inputs[handleId];
      return handle?.type ?? "default";
    }, [node, handleId, type]);

    const { state, handlers } = useMouseEvent({
      enter: true,
      leave: true,
      down: true,
      up: true,
    });

    // Référence du node dans le workflow
    useEffect(() => {
      if (!workflow.current) return;
      nodeRef.current = workflow.current.querySelector(`#${node.id}`);
    }, [workflow, node.id]);

    // Gestion de la création d'arête en cours
    useEffect(() => {
      if (state.isDown) {
        setPendingEdge({ handleId, nodeId: node.id });
      }
    }, [state.isDown, setPendingEdge, handleId, node.id]);

    // Couleur finale
    const backgroundColor = typeColors[handleType];

    // Position du handle
    const handlePosition = {
      left:
        type === "target"
          ? `calc(0% - ${handleSize / 2 + 10}px)`
          : `calc(100% - ${handleSize / 2 - 10}px)`,
      top: `calc(50% - ${handleSize / 2}px)`,
    };

    // Valeur du tooltip
    const value =
      type === "target"
        ? node.content.ports.inputs[handleId]?.value
        : node.content.ports.outputs[handleId]?.value;


    return (
      <div className="relative flex w-full z-0">
        {/* Handle */}
        <div className="absolute" style={handlePosition}>
          <div
            id={handleId}
            ref={handleRef}
            data-handle={JSON.stringify({
              id: handleId,
              nodeId: node.id,
              type,
            })}
            {...handlers}
            className="relative flex items-center justify-center pointer-events-auto handle undraggable"
            style={{
              width: handleSize,
              height: handleSize,
              borderRadius,
              backgroundColor,
            }}
          >
            <ValueToolTip isHovered={state.isHover} value={value} />
            {/* Outline animé */}
            <motion.div
              className="absolute w-6 h-6 rounded-full pointer-events-none"
              style={{ outline: `solid 2px ${backgroundColor}` }}
              animate={{ scale: state.isHover ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />{" "}
            {/* Qu'est ce que ca veut dire quand l'animation de ce truc ce relance alors que la page n'a pas rerender??? */}
            {/* Clip ou décoration supplémentaire */}
            <div className="absolute w-6 h-6 rounded-full clip-handle" />
          </div>
        </div>

        {/* Children / Label */}
        <div
          className={`w-full flex items-center ${
            type === "source" ? "justify-end" : "justify-start"
          }`}
        >
          {children}
        </div>
      </div>
    );
  },
);

export default WorkflowHandle;
