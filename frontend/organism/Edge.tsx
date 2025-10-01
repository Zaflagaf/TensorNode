"use client";

// (import) bibliotheques externes
import React, { useCallback, useEffect, useMemo, useRef } from "react";

// (import) types
import type { EdgeType } from "../schemas/edge";

// (import) useStores
import { cn } from "../lib/utils";
import { useEdgesStore } from "../store/edgesStore";
import { useNodesStore } from "../store/nodesStore";
import { useWorkflowStore } from "../store/workflowStore";
import { useZoomStore } from "../store/zoomStore";

interface EdgeState {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  left: number;
  top: number;
  width: number;
  height: number;
  isValid: boolean;
}

function getCurvePath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.abs(x2 - x1);
  const controlX1 = x1 + dx / 3;
  const controlY1 = y1;
  const controlX2 = x2 - dx / 3;
  const controlY2 = y2;

  return `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;
}

const arePropsEqual = (
  prevProps: { edge: EdgeType },
  nextProps: { edge: EdgeType }
) => {
  return (
    prevProps.edge.selected === nextProps.edge.selected &&
    prevProps.edge.sourceNode === nextProps.edge.sourceNode &&
    prevProps.edge.targetNode === nextProps.edge.targetNode &&
    prevProps.edge.sourceHandle === nextProps.edge.sourceHandle &&
    prevProps.edge.targetHandle === nextProps.edge.targetHandle
  );
};

const WorkflowEdge = React.memo(({ edge }: { edge: EdgeType }) => {
  const workflow = useWorkflowStore((state) => state.workflow);
  const transformRef = useZoomStore((state) => state.transformRef);
  const zoom = useZoomStore((state) => state.zoom); // Use zoom state instead of ref
  const hitboxRef = useRef<SVGPathElement | null>(null);
  const sourceNodePosition = useNodesStore(
    (state) => state.nodesPosition[edge.sourceNode]
  );
  const targetNodePosition = useNodesStore(
    (state) => state.nodesPosition[edge.targetNode]
  );
  const setSelectedEdge = useEdgesStore(
    (state) => state.actions.setSelectedEdge
  );
  const removeEdge = useEdgesStore((state) => state.actions.removeEdge);

  const sourceHandleRef = useRef<HTMLDivElement | null>(null);
  const targetHandleRef = useRef<HTMLDivElement | null>(null);
  const lastValidStateRef = useRef<EdgeState | null>(null);

  const [edgeState, setEdgeState] = React.useState<EdgeState>({
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

  /* Selected node logic */
  useEffect(() => {
    const container = hitboxRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.key === "Backspace" &&
        edge.selected &&
        !target.classList.contains("undraggable")
      ) {
        removeEdge(edge.id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [edge.id, edge.selected, setSelectedEdge]);

  const calculateEdgeState = useCallback((): EdgeState | null => {
    if (!workflow.current) return null;

    if (!sourceHandleRef.current || !targetHandleRef.current) {
      const sourceNode = workflow.current.querySelector("#" + edge.sourceNode);
      const targetNode = workflow.current.querySelector("#" + edge.targetNode);

      if (!sourceNode || !targetNode) return null;

      sourceHandleRef.current = sourceNode.querySelector(
        "#" + edge.sourceHandle
      );
      targetHandleRef.current = targetNode.querySelector(
        "#" + edge.targetHandle
      );
    }

    if (!sourceHandleRef.current || !targetHandleRef.current) return null;

    const sourceHandleBox = sourceHandleRef.current.getBoundingClientRect();
    const targetHandleBox = targetHandleRef.current.getBoundingClientRect();
    const canvasRect = workflow.current.getBoundingClientRect();

    const scale = zoom || 1;
    const transform = transformRef.current;

    const x1 =
      (sourceHandleBox.left -
        canvasRect.left +
        sourceHandleBox.width / 2 -
        transform.x) /
      scale;
    const y1 =
      (sourceHandleBox.top -
        canvasRect.top +
        sourceHandleBox.height / 2 -
        transform.y) /
      scale;
    const x2 =
      (targetHandleBox.left -
        canvasRect.left +
        targetHandleBox.width / 2 -
        transform.x) /
      scale;
    const y2 =
      (targetHandleBox.top -
        canvasRect.top +
        targetHandleBox.height / 2 -
        transform.y) /
      scale;

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    return {
      x1,
      y1,
      x2,
      y2,
      left,
      top,
      width,
      height,
      isValid: true,
    };
  }, [
    edge.sourceNode,
    edge.targetNode,
    edge.sourceHandle,
    edge.targetHandle,
    workflow,
    transformRef,
    zoom,
  ]);

  useEffect(() => {
    let frameRequested = false;
    let latestState: EdgeState | null = null;

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

      if (newState) {
        const last = lastValidStateRef.current;
        const significantChange =
          !last ||
          Math.abs(last.x1 - newState.x1) > 0.1 ||
          Math.abs(last.y1 - newState.y1) > 0.1 ||
          Math.abs(last.x2 - newState.x2) > 0.1 ||
          Math.abs(last.y2 - newState.y2) > 0.1;

        if (significantChange) {
          latestState = newState;
          if (!frameRequested) {
            frameRequested = true;
            requestAnimationFrame(updateEdge);
          }
        }
      } else {
        sourceHandleRef.current = null;
        targetHandleRef.current = null;
        latestState = { ...edgeState, isValid: false };
        if (!frameRequested) {
          frameRequested = true;
          requestAnimationFrame(updateEdge);
        }
      }
    };

    computeAndRequest();
  }, [calculateEdgeState, sourceNodePosition, targetNodePosition]);

  const handleOnClick = () => {
    setSelectedEdge(edge.id);
  };

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
    [edgeState.left, edgeState.top, edgeState.width, edgeState.height]
  );

  if (!edgeState.isValid) return null;

  return (
    <svg {...svgProps}>
      <path
        ref={hitboxRef}
        d={getCurvePath(
          edgeState.x1 < edgeState.x2 ? 0 : edgeState.width,
          edgeState.y1 < edgeState.y2 ? 0 : edgeState.height,
          edgeState.x1 < edgeState.x2 ? edgeState.width : 0,
          edgeState.y1 < edgeState.y2 ? edgeState.height : 0
        )}
        onClick={handleOnClick}
        className="cursor-pointer pointer-events-auto stroke-10 stroke-transparent fill-none"
        strokeLinecap="round"
      />

      <path
        d={getCurvePath(
          edgeState.x1 < edgeState.x2 ? 0 : edgeState.width,
          edgeState.y1 < edgeState.y2 ? 0 : edgeState.height,
          edgeState.x1 < edgeState.x2 ? edgeState.width : 0,
          edgeState.y1 < edgeState.y2 ? edgeState.height : 0
        )}
        className={cn(
          "cursor-pointer pointer-events-none  fill-none",
          edge.selected
            ? "stroke-neutral-50 stroke-2"
            : "stroke-neutral-500 stroke-2"
        )}
        strokeLinecap="round"
      />
    </svg>
  );
}, arePropsEqual);

WorkflowEdge.displayName = "WorkflowEdge";

export default WorkflowEdge;
