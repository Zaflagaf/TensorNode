"use client";
import React, { useEffect, useRef, useCallback, useLayoutEffect } from "react";
import CanvasTransformation from "./CanvasTransformation";
import Node1 from "../node/Assets/node1/Node1";
import "./canvas.scss";
import { useFlowContext } from "@/context/FlowContext";
import EdgeComponent from "../edge/Edge";
import DragEdgeComponent from "../edge/DragEdge";
import { MLContextMenu } from "../other/ContextMenu";
import { useZoom } from "@/context/ZoomContext";
import { Node, Edge } from "../other/FlowType";

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

  const handleItemClick = (e: React.MouseEvent, item: any) => {
    if (!canvasRef.current) return;

    const position = projectPosition({ x: e.clientX, y: e.clientY });
    if (!position) return;
    addNode(item, position);
  };

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button === 1) return; // bouton du milieu

      const target = e.target as HTMLElement;

      const nodeElement = target.closest(".node") as HTMLElement | null;
      const edgeElement = target.closest(".edge") as HTMLElement | null;

      if (nodeElement?.dataset.id) {
        setActiveNode(nodeElement.dataset.id);
      } else {
        setActiveNode("");
      }

      if (edgeElement?.dataset.id) {
        setActiveEdge(edgeElement.dataset.id);
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
    <MLContextMenu onSelect={(item, e) => handleItemClick(e, item)}>
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
            const NodeComponent = nodesType[node.type] || Node1;
            console.log(node.data.values)
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
  );
}
