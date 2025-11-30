"use client";

import useIsSelected from "@/frontend/hooks/optimizer/useIsSelected";
import { Node } from "@/frontend/types";
import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import { useShallow } from "zustand/shallow";
import { cn } from "../../lib/utils";
import { useNodesStore } from "../../store/nodesStore";
import { useWorkflowStore } from "../../store/workflowStore";
import { useZoomStore } from "../../store/zoomStore";

const WorkflowNode = ({
  node,
  className,
  children,
  ...props
}: { node: Node } & React.ComponentProps<"div">) => {
  const { setNodePos, setNodeBounds, problematicNodes } = useNodesStore(
    useShallow((state) => ({
      setNodePos: state.actions.setNodePos,
      setNodeBounds: state.actions.setNodeBounds,
      problematicNodes: state.problematicNodes,
    }))
  );
  const isSelected = useIsSelected(node.id);
  const isGrid = useWorkflowStore(useShallow((state) => state.mode === "grid"));
  const freezeTransformClassName = useWorkflowStore(
    (state) => state.freezeTransformClassName
  );
  const nodeRef = useRef<HTMLDivElement>(null);
  const childrenContainerRef = useRef<HTMLDivElement>(null);

  const tempPosRef = useRef({
    x: node.box.position.x,
    y: node.box.position.y,
  });

  // -----------------------------
  // 1. Mouse selection
  // -----------------------------
  useEffect(() => {
    const container = childrenContainerRef.current;
    if (!container) return;

    const handleMouseDown = () => {
      const selectedNodes = useNodesStore.getState().selectedNodes;
      if (!selectedNodes.includes(node.id))
        useNodesStore.setState({ selectedNodes: [node.id] });
    };
    container.addEventListener("mousedown", handleMouseDown);
    return () => container.removeEventListener("mousedown", handleMouseDown);
  }, [node.id]);

  // -----------------------------
  // 2. Drag logic
  // -----------------------------
  useEffect(() => {
    if (!nodeRef.current || !node.box.position) return;
    const nodeEl = d3.select(nodeRef.current);

    nodeEl
      .style("left", `${tempPosRef.current.x}px`)
      .style("top", `${tempPosRef.current.y}px`);

    let startLeft = 0;
    let startTop = 0;
    let startX = 0;
    let startY = 0;

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
        const scale = useZoomStore.getState().transform.k || 1;

        startLeft = tempPosRef.current.x;
        startTop = tempPosRef.current.y;
        startX = event.x / scale;
        startY = event.y / scale;
      })
      .on("drag", (event) => {
        const scale = useZoomStore.getState().transform.k || 1;

        let newLeft = startLeft + (event.x / scale - startX);
        let newTop = startTop + (event.y / scale - startY);

        if (isGrid) {
          const gridSize = 25;
          newLeft = Math.round(newLeft / gridSize) * gridSize;
          newTop = Math.round(newTop / gridSize) * gridSize;
        }

        tempPosRef.current = { x: newLeft, y: newTop };

        nodeEl.style("left", `${newLeft}px`);
        nodeEl.style("top", `${newTop}px`);
      })
      .on("end", () => {
        setNodePos(node.id, tempPosRef.current.x, tempPosRef.current.y);
      });

    nodeEl.call(dragBehavior as any);

    return () => {
      nodeEl.on(".drag", null);
    };
  }, [node.id, isGrid]);

  // -----------------------------
  // 3. Observe size changes
  // -----------------------------
  useEffect(() => {
    const el = childrenContainerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setNodeBounds(node.id, width, height);
      }
    });

    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [node.id, setNodeBounds]);

  return (
    <div
      id={node.id}
      ref={nodeRef}
      className="absolute flex flex-col gap-2 node"
    >
      <div
        ref={childrenContainerRef}
        className={cn(
          "rounded-xs min-w-[250px] bg-card shadow-[0px_0px_8px_4px_rgba(0,0,0,0.5)]",
          problematicNodes.includes(node.id) &&
            "outline-hue-20 outline-2 text-white",
          isSelected && "outline-2 outline-primary",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export default WorkflowNode;
