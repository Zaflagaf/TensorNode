"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef } from "react";
import { NodeType } from "../schemas/node";
import { useConnectionStore } from "../store/connectionsStore";
import { useWorkflowStore } from "../store/workflowStore";

import useMouseEvent from "../hooks/useMouse";


const WorkflowHandle = React.memo(
  ({
    children,
    type,
    id,
    port,
    node,
  }: {
    children: React.ReactNode;
    type: string;
    id: string;
    port: string;
    node: NodeType;
  }) => {
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const handleRef = useRef<HTMLDivElement | null>(null);
    const workflow = useWorkflowStore((state) => state.workflow);
    const setConnection = useConnectionStore(
      (state) => state.actions.setConnection
    );
    const handleSize = 10;

    const { state, handlers } = useMouseEvent({
      enter: true,
      leave: true,
      down: true,
      up: true,
    });

    useEffect(() => {
      if (!workflow.current) return;
      nodeRef.current = workflow.current?.querySelector("#" + node.id);
    }, []);

    useEffect(() => {
      if (state.isDown) {
        setConnection({ sourceHandle: id, sourceNode: node.id });
      }
    }, [state.isDown]);

    return (
      <div className="relative flex w-full">
        <div
          className="absolute"
          style={{
            left:
              type === "target"
                ? `calc(0% - ${handleSize / 2 + 10}px)`
                : `calc(100% - ${handleSize / 2 - 10}px)`,
            top: `calc(50% - ${handleSize / 2}px)`,
          }}
        >
          <div
            id={id}
            ref={handleRef}
            data-node={node.id}
            data-type={type}
            data-port={port}
            data-extra={node.content.ports.outputs.model ?? "None"}
            {...handlers}
            className="relative flex items-center justify-center pointer-events-auto handle undraggable"
            style={{
              width: handleSize,
              height: handleSize,
              borderRadius: 5,

              backgroundColor: `${"rgb(200,200,200)"}`,
            }}
          >
            <motion.div
              className="absolute w-6 h-6 rounded-full pointer-events-none"
              style={{ outline: `solid 2px ${"rgb(100,100,100)"}` }}
              animate={{ scale: state.isHover ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <div className="absolute w-6 h-6 rounded-full clip-handle" />
          </div>
        </div>
        <div
          className={`w-full flex items-center ${
            type === "source" ? "justify-end" : "justify-start"
          }`}
        >
          {children}
        </div>
      </div>
    );
  }
);

export default WorkflowHandle;
