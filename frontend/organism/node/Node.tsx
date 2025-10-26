"use client";

import { Node } from "@/frontend/types";
import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { useLayersStore } from "../canvas/store/layersStore";
import { useWorkflowStore } from "../canvas/store/workflowStore";
import { useZoomStore } from "../canvas/store/zoomStore";
import { useEdgesStore } from "../edge/store/edgesStore";
import { useNodesStore } from "./store/nodesStore";

const Children = React.memo(({ children }: { children: React.ReactNode }) => {
  const savedChildren = useRef<React.ReactNode>(children);

  useEffect(() => {
    savedChildren.current = children;
  }, [children]);

  return savedChildren.current;
});

const WorkflowNode = React.memo(
  ({
    node,
    className,
    children,
    ...props
  }: { node: Node } & React.ComponentProps<"div">) => {

    const setNodeState = useNodesStore((state) => state.actions.setNodeState);
    const setNodePos = useNodesStore((state) => state.actions.setNodePos);
    const setNodeBounds = useNodesStore((state) => state.actions.setNodeBounds);
    const freezeTransformClassName = useWorkflowStore(
      (state) => state.freezeTransformClassName
    );
    const nodeRef = useRef<HTMLDivElement | null>(null);
    const childrenContainerRef = useRef<HTMLDivElement | null>(null);

    const setSelectedNode = useNodesStore(
      (state) => state.actions.setSelectedNode
    );
    const removeNode = useNodesStore((state) => state.actions.removeNode);
    const removeNodeFromLayer = useLayersStore(
      (state) => state.actions.removeNodeFromLayer
    );
    const currentLayer = useLayersStore((state) => state.currentLayer);

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
          currentLayer &&
          e.key === "Backspace" &&
          node.states.selected &&
          !freezeTransformClassName.node.some((cls) =>
            target.classList.contains(cls)
          )
        ) {
          removeNode(node.id);
          removeEdgeRelativeToNode(node.id);
          removeNodeFromLayer(currentLayer, node.id);
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
    }, [node.id, node.states.selected, setSelectedNode]);

    /* Mini map box info */
    useEffect(() => {
      if (!nodeRef.current || !node.box.position) return;

      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setNodeBounds(node.id, width, height);
        }
      });

      observer.observe(nodeRef.current);

      return () => observer.disconnect();
    }, [node.id]);

    /* Drag node logic */
    useEffect(() => {
      if (!nodeRef.current || !node.box.position) return;
      const nodeEl = d3.select(nodeRef.current);

      // Initialiser la position
      nodeEl
        .style("left", `${node.box.position.x}px`)
        .style("top", `${node.box.position.y}px`);

      let frameRequested = false;
      let lastLeft = node.box.position.x;
      let lastTop = node.box.position.y;

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
          setNodeState(node.id, "dragged", true);

          const scale = useZoomStore.getState().transform.k || 1

          startLeft = lastLeft;
          startTop = lastTop;
          startX = event.x / scale;
          startY = event.y / scale;
        })
        .on("drag", (event) => {
          const scale = useZoomStore.getState().transform.k || 1;

          lastLeft = + startLeft + (event.x / scale - startX) ;
          lastTop = + startTop + (event.y / scale - startY) ;

          if (!frameRequested) {
            frameRequested = true;
            requestAnimationFrame(() => {
              nodeEl.style("left", `${lastLeft}px`);
              nodeEl.style("top", `${lastTop}px`);
              setNodePos(node.id, lastLeft, lastTop);
              frameRequested = false;
            });
          }
        })
        .on("end", () => {
          setNodeState(node.id, "dragged", false);
        });

      nodeEl.call(dragBehavior as any);

      return () => {
        nodeEl.on(".drag", null);
      };
    }, [node.id, setNodePos]);

    return (
      <div
        id={node.id}
        ref={nodeRef}
        className="absolute flex flex-col gap-2 node"
      >
        <div
          ref={childrenContainerRef}
          className={cn(
            "bg-card shadow-[10px_10px_15px_0px] shadow-neutral-900/5 rounded-[5px] min-w-[250px]",
            node.states.selected
              ? "outline-2  outline-foreground"
              : "outline-1  outline-border",
            className
          )}
          {...props}
        >
          <Children children={children} />
        </div>
      </div>
    );
  }
);

export default WorkflowNode;
