"use client";

import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import { NodeType } from "../schemas/node";
import { useNodesStore } from "../store/nodesStore";
import { useZoomStore } from "../store/zoomStore";

const WorkflowNode = React.memo(
  ({ node, children }: { node: NodeType; children: React.ReactNode }) => {
    const zoomRef = useZoomStore((state) => state.zoomRef); // zoom scale
    const setNodePos = useNodesStore((state) => state.actions.setNodePos);
    const setNodeBox = useNodesStore((state) => state.actions.setNodeBox);
    const nodeRef = useRef<HTMLDivElement | null>(null);

    const nodePosition = useNodesStore((state) => state.nodesPosition[node.id]);
    
    useEffect(() => {
      if (!nodeRef.current) return;

      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setNodeBox(node.id, width, height);
        }
      });

      observer.observe(nodeRef.current);

      return () => observer.disconnect();
    }, [node.id, setNodeBox]);

    useEffect(() => {
      if (!nodeRef.current) return;
      const nodeEl = d3.select(nodeRef.current);

      // On initialise la position directement (style)
      nodeEl
        .style("left", `${nodePosition.x }px`)
        .style("top", `${nodePosition.y}px`);

      const dragBehavior = d3
        .drag<HTMLDivElement, unknown>()
        .filter((event) => {
          const target = event.target as HTMLElement;
          // Ignore les handles ou éléments interactifs React
          return !target.closest(".undraggable");
        })
        .on("start", (event) => {
          nodeEl.raise(); // met le node au dessus pendant le drag
        })
        .on("drag", (event) => {
          const scale = zoomRef.current || 1;

          const left =
            parseFloat(nodeEl.style("left") || "0") + event.dx / scale;
          const top = parseFloat(nodeEl.style("top") || "0") + event.dy / scale;

          nodeEl.style("left", `${left}px`);
          nodeEl.style("top", `${top}px`);

          // mise à jour mutable, pas de rerender React
          setNodePos(node.id, left, top);
        });

      nodeEl.call(dragBehavior as any);

      return () => {
        nodeEl.on(".drag", null); // cleanup
      };
    }, [node.id, zoomRef, setNodePos, nodePosition.x, nodePosition.y]);

    return (
      <div
        id={node.id}
        ref={nodeRef}
        className="absolute flex flex-col gap-2 node"
      >
        <p className="text-2xl text-neutral-600">{node.id}</p>
        <div className="bg-white border border-neutral-400 shadow-[0px_10px_15px_5px] shadow-black/5 rounded-2xl">
          {children}
        </div>
      </div>
    );
  }
);

export default WorkflowNode;
