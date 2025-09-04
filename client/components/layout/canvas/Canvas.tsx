"use client";
import { MLContextMenu } from "@/components/other/ContextMenu";
import DragEdgeComponent from "@/components/shared/edge/DragEdge";
import EdgeComponent from "@/components/shared/edge/Edge";
import { useFlowContext } from "@/context/FlowContext";
import { useZoom } from "@/context/ZoomContext";
import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import CanvasTransformation from "./CanvasTransformation";
import "./canvas.scss";

export default function Canvas() {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const {
    nodes,
    edges,
    dragEdge,
    nodesType,
    setActiveNode,
    activeNode,
    setActiveEdge,
    activeEdge,
    addNode,
    removeNode,
    setNodes,
  } = useFlowContext();
  const { projectPosition } = useZoom();

  const edgeRefs = useRef<Map<string, any>>(new Map());

  const handleItemClick = (
    item: string,
    category: string,
    e: React.MouseEvent
  ) => {
    if (!canvasRef.current) return;

    const position = projectPosition({ x: e.clientX, y: e.clientY });
    if (!position) return;
    addNode(item, position);
  };

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button === 1 || e.button === 2) return;

      const target = e.target as HTMLElement;

      if (
        target.classList.contains("undraggable") ||
        target.closest(".undraggable")
      ) {
        setActiveNode("");
        return;
      }

      const nodeElement = target.closest(".node") as HTMLElement | null;
      const edgeElement = target.closest(".edge") as HTMLElement | null;

      if (nodeElement?.id) {
        setActiveNode(nodeElement.id);
      } else {
        setActiveNode("");
      }

      if (edgeElement?.id) {
        setActiveEdge(edgeElement.id);
      } else {
        setActiveEdge("");
      }
    },
    [setActiveNode, setActiveEdge]
  );

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && activeNode) {
        removeNode(activeNode);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [activeNode, removeNode]);

  useLayoutEffect(() => {
    let animationFrameId: number;
    canvasRef.current?.addEventListener("mousedown", handleMouseDown);

    const loop = () => {
      edgeRefs.current.forEach((ref) => {
        ref.updatePath();
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvasRef.current?.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div
      id="editor"
      className="relative flex w-full h-full overflow-hidden outline-1 outline-zinc-600 bg-zinc-500"
    >
      <MLContextMenu
        onSelect={(item, category, e) => handleItemClick(item, category, e)}
      >
        <CanvasTransformation trigger="#canvas">
          <div ref={canvasRef} id="canvas">
            {Object.values(edges).map((edge) => {
              return (
                <EdgeComponent
                  ref={(ref) => {
                    if (ref) edgeRefs.current.set(edge.id, ref);
                    else edgeRefs.current.delete(edge.id);
                  }}
                  key={edge.id}
                  id={edge.id}
                  source={edge.source}
                  target={edge.target}
                  sourceHandle={edge.sourceHandle}
                  targetHandle={edge.targetHandle}
                />
              );
            })}
            {Object.values(nodes).map((node) => {
              const NodeComponent = nodesType[node.type];
              return (
                <NodeComponent
                  key={node.id}
                  id={node.id}
                  position={node.position}
                  label={node.data.label}
                  values={node.data.values}
                />
              );
            })}
            {dragEdge && <DragEdgeComponent id="d1" sourceHandle={dragEdge} />}
          </div>
        </CanvasTransformation>
      </MLContextMenu>
    </div>
  );
}
