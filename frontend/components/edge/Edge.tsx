"use client";

import { EdgeComponent, EdgeGeometry } from "@/frontend/types";
import getCurvePath from "@/frontend/utils/get/getCurvePath";
import getTransformed from "@/frontend/utils/get/getTransformed";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { typeColors } from "../../config/data/data";
import { useEdgesStore } from "../../store/edgesStore";
import { useNodesStore } from "../../store/nodesStore";
import getType from "@/frontend/utils/get/getType";

const WorkflowEdge: React.FC<EdgeComponent> = ({ edge }) => {
  const nodeEditorRef = useRef<HTMLElement>(null);
  const setSelectedEdge = useEdgesStore(
    (state) => state.actions.setSelectedEdge
  );
  const removeEdge = useEdgesStore((state) => state.actions.removeEdge);
  const nodeSourceRef = useRef<Element>(null);
  const handleSourceRef = useRef<Element>(null);
  const nodeTargetRef = useRef<Element>(null);
  const handleTargetRef = useRef<Element>(null);

  const [edgeGeometry, setEdgeGeometry] = useState<EdgeGeometry>({
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

  const { fromColor, toColor } = useMemo(() => {
    return {
      fromColor:
        typeColors[
          getType(edge.source.nodeId, edge.source.handleId, "outputs")
        ],
      toColor:
        typeColors[getType(edge.target.nodeId, edge.target.handleId, "inputs")],
    };
  }, [edge]);

  useEffect(() => {
    nodeEditorRef.current = document.getElementById("canvas");

    nodeSourceRef.current = document.querySelector(`#${edge.source.nodeId}`);
    handleSourceRef.current = document.querySelector(
      `#${edge.source.nodeId} #${edge.source.handleId}`
    );
    nodeTargetRef.current = document.querySelector(`#${edge.target.nodeId}`);
    handleTargetRef.current = document.querySelector(
      `#${edge.target.nodeId} #${edge.target.handleId}`
    );
    calculateEdgeGeometry();
  }, []);

  useEffect(() => {
    if (!nodeSourceRef.current || !nodeTargetRef.current) return;

    // --- Observer pour les attributs style / className ---
    const mutationObserver = new MutationObserver(() => {
      calculateEdgeGeometry();
    });

    const options = {
      attributes: true,
      attributeFilter: ["style", "class"],
    };

    mutationObserver.observe(nodeSourceRef.current, options);
    mutationObserver.observe(nodeTargetRef.current, options);

    // --- Observer pour les changements de taille ---
    const resizeObserver = new ResizeObserver(() => {
      calculateEdgeGeometry();
    });

    resizeObserver.observe(nodeSourceRef.current);
    resizeObserver.observe(nodeTargetRef.current);

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (edge.states.selected && e.key === "Backspace") {
        removeEdge(edge.id);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [edge.states.selected]);

  const calculateEdgeGeometry = useCallback(() => {
    if (
      !nodeEditorRef.current ||
      !handleSourceRef.current ||
      !handleTargetRef.current
    )
      return;

    const sourcePos = getTransformed(
      handleSourceRef.current,
      nodeEditorRef.current
    );
    const targetPos = getTransformed(
      handleTargetRef.current,
      nodeEditorRef.current
    );
    if (!sourcePos || !targetPos) return;

    const x1 = sourcePos.x;
    const y1 = sourcePos.y;
    const x2 = targetPos.x;
    const y2 = targetPos.y;

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const [sx, sy, ex, ey] = [
      x1 < x2 ? 0 : width,
      y1 < y2 ? 0 : height,
      x1 < x2 ? width : 0,
      y1 < y2 ? height : 0,
    ];

    setEdgeGeometry({
      x1: sx,
      y1: sy,
      x2: ex,
      y2: ey,
      left,
      top,
      width,
      height,
      isValid: true,
    });
  }, []);

  if (!edgeGeometry.isValid) return null;

  return (
    <svg
      className="absolute overflow-visible pointer-events-none"
      style={{
        left: edgeGeometry.left,
        top: edgeGeometry.top,
        width: edgeGeometry.width,
        height: edgeGeometry.height,
      }}
    >
      <defs>
        <linearGradient
          id={`edge-gradient-${edge.id}`}
          gradientUnits="userSpaceOnUse"
          x1={edgeGeometry.x1}
          y1={edgeGeometry.y1}
          x2={edgeGeometry.x2}
          y2={edgeGeometry.y2}
        >
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
      </defs>

      <path
        d={getCurvePath(
          edgeGeometry.x1,
          edgeGeometry.y1,
          edgeGeometry.x2,
          edgeGeometry.y2
        )}
        onClick={() => setSelectedEdge(edge.id)}
        className="cursor-pointer pointer-events-auto fill-none stroke-20 stroke-transparent"
        strokeLinecap="round"
      />
      <path
        d={getCurvePath(
          edgeGeometry.x1,
          edgeGeometry.y1,
          edgeGeometry.x2,
          edgeGeometry.y2
        )}
        className="pointer-events-none fill-none stroke-2"
        stroke={
          edge.states.selected
            ? "var(--color-accent-foreground)"
            : `url(#edge-gradient-${edge.id})`
        }
        strokeLinecap="round"
      />
    </svg>
  );
};

export default WorkflowEdge;
