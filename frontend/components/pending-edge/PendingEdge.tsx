"use client";

import { typeColors } from "@/frontend/config/data/data";
import useId from "@/frontend/hooks/useId";
import { getWorkflowTransformedPoint } from "@/frontend/lib/getWorkflowTransformedPoint";
import propagatePorts from "@/frontend/lib/node&edge-logic/propagatePorts";
import { useEdgesStore } from "@/frontend/store/edgesStore";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { usePendingEdgeStore } from "@/frontend/store/pendingEdgeStore";
import { useZoomStore } from "@/frontend/store/zoomStore";
import { EdgeGeometry, PendingEdge } from "@/frontend/types";
import getCurvePath from "@/frontend/utils/get/getCurvePath";
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";

function WorkflowPendingEdge({ pendingEdge }: { pendingEdge: PendingEdge }) {
  const pendingEdgeId = useId();

  const nodeEditorRef = useRef<HTMLElement>(null);
  const transform = useZoomStore((state) => state.transform);

  const setPendingEdge = usePendingEdgeStore(
    (state) => state.actions.setPendingEdge
  );
  const addEdge = useEdgesStore((state) => state.actions.addEdge);
  const removeEdgeRelativeToNodeAndTargetHandle = useEdgesStore(
    (state) => state.actions.removeEdgeRelativeToNodeAndTargetHandle
  );
  const setNodes = useNodesStore((state) => state.actions.setNodes);
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
  const handleRef = useRef<HTMLDivElement | null>(null);

  const { fromColor, toColor } = useMemo(() => {
    const nodes = useNodesStore.getState().nodes;
    const node = nodes[pendingEdge.nodeId];

    const isSource =
      node.content.ports.outputs[pendingEdge.handleId] !== undefined;
    const handleType =
      node.content.ports[isSource ? "outputs" : "inputs"][pendingEdge.handleId]
        .type;

    return {
      fromColor: typeColors[isSource ? handleType : "default"],
      toColor: typeColors[isSource ? "default" : handleType],
    };
  }, [pendingEdge]);

  useEffect(() => {
    nodeEditorRef.current = document.getElementById("canvas");
  }, []);

  useEffect(() => {
    if (!pendingEdge || !nodeEditorRef.current) return;

    const nodeElement = nodeEditorRef.current.querySelector(
      "#" + pendingEdge.nodeId
    );
    const handleElement = nodeElement?.querySelector(
      "#" + pendingEdge.handleId
    );

    if (!handleElement) return;

    handleRef.current = handleElement as HTMLDivElement | null;
  }, [pendingEdge, nodeEditorRef]);

  useEffect(() => {
    if (!handleRef.current || !nodeEditorRef.current) return;

    const handleMouseMove = (event: MouseEvent) => {
      const box = handleRef.current!.getBoundingClientRect();

      if (!nodeEditorRef.current || !transform) return;

      const pos = getWorkflowTransformedPoint(
        box,
        nodeEditorRef.current,
        transform
      );
      if (!pos) return;

      let targetPos = { x: 0, y: 0 };

      const target = event.target as Element;

      if (target.classList.contains("clip-handle")) {
        const targetHandle = target.closest(".handle");
        if (!targetHandle) return;
        const box = targetHandle.getBoundingClientRect();

        const p = getWorkflowTransformedPoint(
          box,
          nodeEditorRef.current,
          transform
        );
        if (!p) return;

        targetPos = p;
      } else {
        const [x, y] = d3.pointer(event, nodeEditorRef.current);

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

    nodeEditorRef.current.addEventListener("mousemove", handleMouseMove);
    nodeEditorRef.current.addEventListener("mouseup", handleMouseUp);
    return () => {
      nodeEditorRef.current?.removeEventListener("mousemove", handleMouseMove);
      nodeEditorRef.current?.removeEventListener("mouseup", handleMouseUp);

      const nodes = useNodesStore.getState().nodes;
      const edges = useEdgesStore.getState().edges;

      const nds = propagatePorts(nodes, edges);
      setNodes(nds);
    };
  }, [handleRef, nodeEditorRef, transform]);

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
      <svg {...svgProps}>
        {" "}
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={xStart}
            y1={yStart}
            x2={xEnd}
            y2={yEnd}
          >
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
      </svg>
    )
  );
}

export default WorkflowPendingEdge;
