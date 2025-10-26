"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { typeColors } from "../../config/data/data";
import { useWorkflowStore } from "../canvas/store/workflowStore";
import { useZoomStore } from "../canvas/store/zoomStore";
import { useNodesStore } from "../node/store/nodesStore";
import { useEdgesStore } from "./store/edgesStore";

import { Edge, EdgeGeometry } from "@/frontend/types";



function getCurvePath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.abs(x2 - x1);
  const controlX1 = x1 + dx / 3;
  const controlX2 = x2 - dx / 3;
  return `M ${x1} ${y1} C ${controlX1} ${y1}, ${controlX2} ${y2}, ${x2} ${y2}`;
}

interface WorkflowEdgeProps {
  edge: Edge;
}

const WorkflowEdge: React.FC<WorkflowEdgeProps> = ({ edge }) => {
  const workflow = useWorkflowStore((state) => state.workflow);

  const transform = useZoomStore((state) => state.transform);

  const hitboxRef = useRef<SVGPathElement | null>(null);
  const sourceHandleRef = useRef<HTMLDivElement | null>(null);
  const targetHandleRef = useRef<HTMLDivElement | null>(null);
  const lastValidStateRef = useRef<EdgeGeometry | null>(null);

  const sourceNodePosition = useNodesStore(
    (state) => state.nodes[edge.source.nodeId]?.box.position
  );
  const targetNodePosition = useNodesStore(
    (state) => state.nodes[edge.target.nodeId]?.box.position
  );
  const setHandleState = useNodesStore((state) => state.actions.setHandleState);
  const setSelectedEdge = useEdgesStore(
    (state) => state.actions.setSelectedEdge
  );
  const removeEdge = useEdgesStore((state) => state.actions.removeEdge);

  // Calcul des couleurs du gradient selon le type des handles
  const { fromColor, toColor } = useMemo(() => {
    const nodes = useNodesStore.getState().nodes;

    const sourceType =
      nodes[edge.source.nodeId]?.content.ports.outputs[edge.source.handleId]
        ?.type ?? "default";
    const targetType =
      nodes[edge.target.nodeId]?.content.ports.inputs[edge.target.handleId]
        ?.type ?? "default";

    return {
      fromColor: typeColors[sourceType],
      toColor: typeColors[targetType],
    };
  }, [edge]);

  // Mettre à jour le store après rendu
  useEffect(() => {
    setHandleState(
      edge.source.nodeId,
      "outputs",
      edge.source.handleId,
      "isBusy",
      true
    );
    setHandleState(
      edge.target.nodeId,
      "inputs",
      edge.target.handleId,
      "isBusy",
      true
    );

    // Optionnel : reset isBusy quand le edge est démonté
    return () => {
      setHandleState(
        edge.source.nodeId,
        "outputs",
        edge.source.handleId,
        "isBusy",
        false
      );
      setHandleState(
        edge.target.nodeId,
        "inputs",
        edge.target.handleId,
        "isBusy",
        false
      );
    };
  }, [
    edge.source.nodeId,
    edge.source.handleId,
    edge.target.nodeId,
    edge.target.handleId,
    setHandleState,
  ]);

  // Suppression via Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" && edge.states.selected) removeEdge(edge.id);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [edge.id, edge.states.selected, removeEdge]);

  // Calcul de la position de l'edge
  const calculateEdgeState = useCallback((): EdgeGeometry | null => {
    if (!workflow.current) return null;

    if (!sourceHandleRef.current || !targetHandleRef.current) {
      const sourceNode = workflow.current.querySelector(
        `#${edge.source.nodeId}`
      );
      const targetNode = workflow.current.querySelector(
        `#${edge.target.nodeId}`
      );
      if (!sourceNode || !targetNode) return null;

      sourceHandleRef.current = sourceNode.querySelector(
        `#${edge.source.handleId}`
      );
      targetHandleRef.current = targetNode.querySelector(
        `#${edge.target.handleId}`
      );
    }

    if (!sourceHandleRef.current || !targetHandleRef.current) return null;

    const sBox = sourceHandleRef.current.getBoundingClientRect();
    const tBox = targetHandleRef.current.getBoundingClientRect();
    const canvasRect = workflow.current.getBoundingClientRect();
    const { x: tx, y: ty, k: scale } = transform;

    const x1 = (sBox.left - canvasRect.left + sBox.width / 2 - tx) / scale;
    const y1 = (sBox.top - canvasRect.top + sBox.height / 2 - ty) / scale;
    const x2 = (tBox.left - canvasRect.left + tBox.width / 2 - tx) / scale;
    const y2 = (tBox.top - canvasRect.top + tBox.height / 2 - ty) / scale;

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    return { x1, y1, x2, y2, left, top, width, height, isValid: true };
  }, [edge, workflow, transform]);

  // Mise à jour de l'état via RAF
  const [edgeState, setEdgeState] = useState<EdgeGeometry>({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    isValid: false,
  });

  useEffect(() => {
    let frameRequested = false;
    let latestState: EdgeGeometry | null = null;

    const updateEdge = () => {
      if (latestState) {
        lastValidStateRef.current = latestState;
        setEdgeState(latestState);
        latestState = null;
      }
      frameRequested = false;
    };

    const computeAndRequest = () => {
      const newState = calculateEdgeState();
      const last = lastValidStateRef.current;

      const significantChange =
        newState &&
        (!last ||
          Math.abs(last.x1 - newState.x1) > 0.1 ||
          Math.abs(last.y1 - newState.y1) > 0.1 ||
          Math.abs(last.x2 - newState.x2) > 0.1 ||
          Math.abs(last.y2 - newState.y2) > 0.1);

      if (significantChange) {
        latestState = newState;
      } else if (!newState) {
        sourceHandleRef.current = null;
        targetHandleRef.current = null;
        latestState = { ...edgeState, isValid: false };
      }

      if (!frameRequested) {
        frameRequested = true;
        requestAnimationFrame(updateEdge);
      }
    };

    computeAndRequest();
  }, [calculateEdgeState, sourceNodePosition, targetNodePosition, edgeState]);

  const handleOnClick = () => setSelectedEdge(edge.id);

  const svgProps = useMemo(
    () => ({
      className: "absolute overflow-visible pointer-events-none",
      style: {
        left: edgeState.left,
        top: edgeState.top,
        width: edgeState.width,
        height: edgeState.height,
      },
    }),
    [edgeState]
  );

  if (!edgeState.isValid) return null;

  const xStart = edgeState.x1 < edgeState.x2 ? 0 : edgeState.width;
  const yStart = edgeState.y1 < edgeState.y2 ? 0 : edgeState.height;
  const xEnd = edgeState.x1 < edgeState.x2 ? edgeState.width : 0;
  const yEnd = edgeState.y1 < edgeState.y2 ? edgeState.height : 0;

  const gradientId = `edge-gradient-${edge.id}`;

  return (
    <svg {...svgProps}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
      </defs>

      {/* Hitbox */}
      <path
        ref={hitboxRef}
        d={getCurvePath(xStart, yStart, xEnd, yEnd)}
        onClick={handleOnClick}
        className="cursor-pointer pointer-events-auto fill-none stroke-20 stroke-transparent z-10 undraggable"
        strokeLinecap="round"
      />

      {/* Edge visible avec dégradé */}
      <path
        d={getCurvePath(xStart, yStart, xEnd, yEnd)}
        className="pointer-events-none fill-none stroke-2"
        stroke={
          edge.states.selected
            ? "var(--color-accent-foreground)"
            : `url(#${gradientId})`
        }
        strokeLinecap="round"
      />
    </svg>
  );
};

WorkflowEdge.displayName = "WorkflowEdge";

export default WorkflowEdge;
