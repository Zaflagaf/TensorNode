"use client";

// (import) bibliotheques externes
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";

// (import) hooks
import useId from "../../hooks/useId";

// (import) useStores
import { useWorkflowStore } from "../canvas/store/workflowStore";
import { useZoomStore } from "../canvas/store/zoomStore";

// (import) types
import { EdgeGeometry, PendingEdge } from "@/frontend/types";

// (import) utils
import { typeColors } from "@/frontend/config/data/data";
import { getWorkflowTransformedPoint } from "../../lib/getWorkflowTransformedPoint";
import propagatePorts from "../../lib/propagatePorts";
import { useEdgesStore } from "../edge/store/edgesStore";
import { useNodesStore } from "../node/store/nodesStore";
import { usePendingEdgeStore } from "./store/pendingEdgeStore";

function getCurvePath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.abs(x2 - x1);
  const controlX1 = x1 + dx / 3;
  const controlX2 = x2 - dx / 3;
  return `M ${x1} ${y1} C ${controlX1} ${y1}, ${controlX2} ${y2}, ${x2} ${y2}`;
}

function WorkflowPendingEdge({ pendingEdge }: { pendingEdge: PendingEdge }) {
  const pendingEdgeId = useId();

  const workflow = useWorkflowStore((state) => state.workflow);
  const transform = useZoomStore((state) => state.transform);

  const setPendingEdge = usePendingEdgeStore(
    (state) => state.actions.setPendingEdge
  );
  const addEdge = useEdgesStore((state) => state.actions.addEdge);
  const removeEdgeRelativeToNodeAndTargetHandle = useEdgesStore(
    (state) => state.actions.removeEdgeRelativeToNodeAndTargetHandle
  );

  const handleRef = useRef<HTMLDivElement | null>(null);

  // Calcul des couleurs du gradient selon le type des handles
  const { fromColor, toColor } = useMemo(() => {
    const nodes = useNodesStore.getState().nodes;

    const sourceType =
      nodes[pendingEdge.nodeId]?.content.ports.outputs[pendingEdge.handleId]
        ?.type ?? "default";

    return {
      fromColor: typeColors[sourceType],
      toColor: typeColors["default"],
    };
  }, [pendingEdge]);

  const [edgeState, setEdgeState] = useState<Omit<EdgeGeometry, "isValid">>({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!pendingEdge || !workflow.current) return;

    const nodeElement = workflow.current.querySelector(
      "#" + pendingEdge.nodeId
    );
    const handleElement = nodeElement?.querySelector(
      "#" + pendingEdge.handleId
    );

    if (!handleElement) return;

    handleRef.current = handleElement as HTMLDivElement | null;
  }, [pendingEdge, workflow]);

  useEffect(() => {
    if (!handleRef.current || !workflow.current) return;

    const handleMouseMove = (event: MouseEvent) => {
      const box = handleRef.current!.getBoundingClientRect();

      if (!workflow.current || !transform) return;

      const pos = getWorkflowTransformedPoint(box, workflow.current, transform);
      if (!pos) return;

      let targetPos = { x: 0, y: 0 };

      const target = event.target as Element;

      if (target.classList.contains("clip-handle")) {
        const targetHandle = target.closest(".handle");
        if (!targetHandle) return;
        const box = targetHandle.getBoundingClientRect();

        const p = getWorkflowTransformedPoint(box, workflow.current, transform);
        if (!p) return;

        targetPos = p;
      } else {
        const [x, y] = d3.pointer(event, workflow.current);

        targetPos = {
          x: (x - transform.x) / transform.k,
          y: (y - transform.y) / transform.k,
        };
      }
      const left = Math.min(pos.x, targetPos.x);
      const top = Math.min(pos.y, targetPos.y);
      const width = Math.abs(targetPos.x - pos.x);
      const height = Math.abs(targetPos.y - pos.y);

      setEdgeState({
        x1: pos.x,
        y1: pos.y,
        x2: targetPos.x,
        y2: targetPos.y,
        left,
        top,
        width,
        height,
      });
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!pendingEdge) return;

      const cancel = () => setPendingEdge(null);

      const getHandleTarget = (el: HTMLElement | null) => {
        if (!el) return null;
        if (el.classList.contains("clip-handle")) {
          el = el.closest<HTMLElement>(".handle");
          if (!el) return null;
        }
        if (!el.classList.contains("handle")) return null;
        return el;
      };

      const target = getHandleTarget(event.target as HTMLElement | null);
      if (!target) return cancel();

      const handleDataStr = target.getAttribute("data-handle");
      if (!handleDataStr) return cancel();

      const { id: handleId, nodeId, type } = JSON.parse(handleDataStr);
      if (!handleId || !nodeId || !type || nodeId === pendingEdge.nodeId)
        return cancel();

      const nodes = useNodesStore.getState().nodes;
      const isSourceASource =
        !!nodes[pendingEdge.nodeId].content.ports.outputs[pendingEdge.handleId];
      const isTargetATarget = !!nodes[nodeId].content.ports.inputs[handleId];

      if (
        (isSourceASource && !isTargetATarget) ||
        (!isSourceASource && isTargetATarget)
      )
        return cancel();

      const [sourceNodeId, sourceHandleId, targetNodeId, targetHandleId] =
        isSourceASource
          ? [pendingEdge.nodeId, pendingEdge.handleId, nodeId, handleId]
          : [nodeId, handleId, pendingEdge.nodeId, pendingEdge.handleId];

      removeEdgeRelativeToNodeAndTargetHandle(targetNodeId, targetHandleId);

      addEdge(
        pendingEdgeId,
        { nodeId: sourceNodeId, handleId: sourceHandleId },
        { nodeId: targetNodeId, handleId: targetHandleId }
      );

      cancel();
    };

    workflow.current.addEventListener("mousemove", handleMouseMove);
    workflow.current.addEventListener("mouseup", handleMouseUp);
    return () => {
      workflow.current?.removeEventListener("mousemove", handleMouseMove);
      workflow.current?.removeEventListener("mouseup", handleMouseUp);
      const nds = propagatePorts();
      if (nds) {
        setTimeout(() => {
          useNodesStore.getState().actions.setNodes(nds);
        }, 0);
      }
    };
  }, [handleRef, workflow, transform]);

  /*   const left = Math.min(path.x1, path.x2);
  const top = Math.min(path.y1, path.y2);
  const width = Math.abs(path.x2 - path.x1);
  const height = Math.abs(path.y2 - path.y1); */

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

  const xStart = edgeState.x1 < edgeState.x2 ? 0 : edgeState.width;
  const yStart = edgeState.y1 < edgeState.y2 ? 0 : edgeState.height;
  const xEnd = edgeState.x1 < edgeState.x2 ? edgeState.width : 0;
  const yEnd = edgeState.y1 < edgeState.y2 ? edgeState.height : 0;

  const gradientId = `edge-gradient-${pendingEdgeId}`;

  return (
    pendingEdge && (
      <svg
        {...svgProps}
        /*         className="absolute pointer-events-none connection"
        style={{
          left,
          top,
          width,
          height,
        }} */
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={fromColor} />
            <stop offset="100%" stopColor={toColor} />
          </linearGradient>
        </defs>

        <path
          d={getCurvePath(xStart, yStart, xEnd, yEnd)}
          className="pointer-events-none fill-none stroke-2"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
        />

        {/*         <line
          x1={path.x1 < path.x2 ? 0 : width}
          y1={path.y1 < path.y2 ? 0 : height}
          x2={path.x1 < path.x2 ? width : 0}
          y2={path.y1 < path.y2 ? height : 0}
          className="stroke-2 stroke-muted-foreground stroke"
          strokeLinecap="round"
        /> */}
      </svg>
    )
  );
}

export default WorkflowPendingEdge;
