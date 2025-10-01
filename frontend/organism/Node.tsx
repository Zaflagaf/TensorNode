"use client";

import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { NodeType } from "../schemas/node";
import { useEdgesStore } from "../store/edgesStore";
import { useNodesStore } from "../store/nodesStore";
import { useWorkflowStore } from "../store/workflowStore";
import { useZoomStore } from "../store/zoomStore";

const WorkflowNode = React.memo(
  ({ node, children }: { node: NodeType; children: React.ReactNode }) => {
    const zoomRef = useZoomStore((state) => state.zoomRef); // zoom scale
    const setNodePos = useNodesStore((state) => state.actions.setNodePos);
    const setNodeBox = useNodesStore((state) => state.actions.setNodeBox);
    const freezeTransformClassName = useWorkflowStore(
      (state) => state.freezeTransformClassName
    );
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const childrenContainerRef = useRef<HTMLDivElement | null>(null);

    const nodePosition = useNodesStore((state) => state.nodesPosition[node.id]);
    const setSelectedNode = useNodesStore(
      (state) => state.actions.setSelectedNode
    );
    const removeNode = useNodesStore((state) => state.actions.removeNode);
    const removeEdgeRelativeToNode = useEdgesStore(
      (state) => state.actions.removeEdgeRelativeToNode
    );

    /* Selected node logic */
    useEffect(() => {
      const container = childrenContainerRef.current;
      if (!container) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;

        if (
          e.key === "Backspace" &&
          node.selected &&
          !freezeTransformClassName.node.some((cls) =>
            target.classList.contains(cls)
          )
        ) {
          removeNode(node.id);
          removeEdgeRelativeToNode(node.id);
        }
      };

      const handleMouseDown = () => {
        setSelectedNode(node.id);
      };

      container.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        container.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [node.id, node.selected, setSelectedNode]);

    /* Mini map box info */
    useEffect(() => {
      if (!nodeRef.current || !nodePosition) return;

      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setNodeBox(node.id, width, height);
        }
      });

      observer.observe(nodeRef.current);

      return () => observer.disconnect();
    }, [node.id, setNodeBox]);

    /* Drag node logic  */
    useEffect(() => {
      if (!nodeRef.current) return;
      const nodeEl = d3.select(nodeRef.current);

      // Initialiser la position
      nodeEl
        .style("left", `${nodePosition.x}px`)
        .style("top", `${nodePosition.y}px`);

      let frameRequested = false;
      let lastLeft = nodePosition.x;
      let lastTop = nodePosition.y;

      const dragBehavior = d3
        .drag<HTMLDivElement, unknown>()
        .filter((event) => {
          const target = event.target as HTMLElement;
          return !freezeTransformClassName.node.some((cls) =>
            target.closest("." + cls)
          );
        })
        .on("start", (event) => {
          nodeEl.raise();
        })
        .on("drag", (event) => {
          const scale = zoomRef.current || 1;

          lastLeft += event.dx / scale;
          lastTop += event.dy / scale;

          if (!frameRequested) {
            frameRequested = true;
            requestAnimationFrame(() => {
              nodeEl.style("left", `${lastLeft}px`);
              nodeEl.style("top", `${lastTop}px`);
              setNodePos(node.id, lastLeft, lastTop);
              frameRequested = false;
            });
          }
        });

      nodeEl.call(dragBehavior as any);

      return () => {
        nodeEl.on(".drag", null);
      };
    }, [node.id, zoomRef, setNodePos]);

    return (
      <div
        id={node.id}
        ref={nodeRef}
        className="absolute flex flex-col gap-2 node"
      >
        {/*         <p className="text-sm  text-neutral-500 rounded-xs px-[4px] flex items-center">
          {node.id}
        </p> */}
        <div
          ref={childrenContainerRef}
          className={cn(
            "bg-gradient-to-br from-node-from-gradient to-node-to-gradient shadow-[10px_10px_15px_0px] shadow-neutral-900/5 rounded-[5px]",
            node.selected
              ? "outline-2  outline-node-outline-active"
              : "outline-1  outline-node-outline"
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

export default WorkflowNode;
