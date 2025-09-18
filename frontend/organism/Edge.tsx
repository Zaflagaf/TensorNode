"use client";

// (import) bibliotheques externes
import React, { useCallback, useEffect, useMemo, useRef } from "react";

// (import) types
import type { EdgeType } from "../schemas/edge";

// (import) useStores
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

const arePropsEqual = (
  prevProps: { edge: EdgeType },
  nextProps: { edge: EdgeType }
) => {
  return (
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
  const sourceNodePosition = useNodesStore(
    (state) => state.nodesPosition[edge.sourceNode]
  );
  const targetNodePosition = useNodesStore(
    (state) => state.nodesPosition[edge.targetNode]
  );

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
    const newState = calculateEdgeState();

    if (newState) {
      if (
        !lastValidStateRef.current ||
        Math.abs(lastValidStateRef.current.x1 - newState.x1) > 0.1 ||
        Math.abs(lastValidStateRef.current.y1 - newState.y1) > 0.1 ||
        Math.abs(lastValidStateRef.current.x2 - newState.x2) > 0.1 ||
        Math.abs(lastValidStateRef.current.y2 - newState.y2) > 0.1
      ) {
        lastValidStateRef.current = newState;
        setEdgeState(newState);
      }
    } else {
      sourceHandleRef.current = null;
      targetHandleRef.current = null;
      setEdgeState((prev) => ({ ...prev, isValid: false }));
    }
  }, [calculateEdgeState, sourceNodePosition, targetNodePosition]);

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

  const lineProps = useMemo(
    () => ({
      x1: edgeState.x1 < edgeState.x2 ? 0 : edgeState.width,
      y1: edgeState.y1 < edgeState.y2 ? 0 : edgeState.height,
      x2: edgeState.x1 < edgeState.x2 ? edgeState.width : 0,
      y2: edgeState.y1 < edgeState.y2 ? edgeState.height : 0,
      className: "stroke-2 stroke-neutral-700 stroke",
      strokeLinecap: "round" as const,
    }),
    [
      edgeState.x1,
      edgeState.x2,
      edgeState.y1,
      edgeState.y2,
      edgeState.width,
      edgeState.height,
    ]
  );

  if (!edgeState.isValid) return null;

  return (
    <svg {...svgProps}>
      <line {...lineProps} />
    </svg>
  );
}, arePropsEqual);

WorkflowEdge.displayName = "WorkflowEdge";

export default WorkflowEdge;
