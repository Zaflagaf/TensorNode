"use client";
import { useFlowContext } from "@/context/FlowContext";
import { useZoom } from "@/context/ZoomContext";
import React, { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import "./edge.scss";

function EdgeComponent({
  id,
  source,
  target,
  sourceHandle,
  targetHandle,
}: {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}) {

    // TU DOIS FAIRE LE SYSTEME DE CALCULAGE SEPARE DU START ET DU END DE TA PATH

    const { zoom } = useZoom();
    const { removeEdge } = useFlowContext();

    const canvasRef = useRef<HTMLElement | null>(null);
    const edgePathRef = useRef<SVGPathElement | null>(null);
    const edgeHitboxRef = useRef<SVGPathElement | null>(null);

    const textRef = useRef<SVGTextElement | null>(null);
    const maskRectRef = useRef<SVGRectElement | null>(null);
    const sourceNodeRef = useRef<HTMLElement | null>(null);
    const targetNodeRef = useRef<HTMLElement | null>(null);

    const startRef = useRef<{ x: number; y: number } | null>(null);
    const endRef = useRef<{ x: number; y: number } | null>(null);
    
    const updatePath = useCallback(() => {
        if (!canvasRef.current || !sourceNodeRef.current || !targetNodeRef.current) return;
        
        const sourceHandleEl = sourceNodeRef.current.querySelector(`#${sourceHandle}`) as HTMLElement;
        const targetHandleEl = targetNodeRef.current.querySelector(`#${targetHandle}`) as HTMLElement;
        
        if (!sourceHandleEl || !targetHandleEl) return;
        
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const sourceRect = sourceHandleEl.getBoundingClientRect();
        const targetRect = targetHandleEl.getBoundingClientRect();
        
        const nextStartX = (sourceRect.x - canvasRect.x + sourceRect.width / 2) / zoom;
        const nextStartY = (sourceRect.y - canvasRect.y + sourceRect.height / 2) / zoom;
        const nextEndX = (targetRect.x - canvasRect.x + sourceRect.width / 2) / zoom;
        const nextEndY = (targetRect.y - canvasRect.y + sourceRect.height / 2) / zoom;
        
        const prevStart = startRef.current;
        const prevEnd = endRef.current;
        
        const hasStartChanged = !prevStart || prevStart.x !== nextStartX || prevStart.y !== nextStartY;
        const hasEndChanged = !prevEnd || prevEnd.x !== nextEndX || prevEnd.y !== nextEndY;
        
        if (!hasStartChanged && !hasEndChanged) {
            return;
        }
        
        // MAJ les refs avec les nouvelles valeurs
        startRef.current = { x: nextStartX, y: nextStartY };
        endRef.current = { x: nextEndX, y: nextEndY };
        
        // Path calculation
        const path = `M ${nextStartX} ${nextStartY} C ${(nextStartX + nextEndX) / 2} ${nextStartY}, ${(nextStartX + nextEndX) / 2} ${nextEndY}, ${nextEndX} ${nextEndY}`;
        const midX = (nextStartX + nextEndX) / 2;
        const midY = (nextStartY + nextEndY) / 2;
        
        if (edgePathRef.current) edgePathRef.current.setAttribute("d", path);
        if (edgeHitboxRef.current) edgeHitboxRef.current.setAttribute("d", path);
        if (textRef.current) {
            textRef.current.setAttribute("x", `${midX}`);
            textRef.current.setAttribute("y", `${midY}`);
        }
        
        if (maskRectRef.current) {
            maskRectRef.current.setAttribute("x", `${midX - 15}`);
            maskRectRef.current.setAttribute("y", `${midY - 15}`);
        }
        
    }, [zoom]);
    useLayoutEffect(() => {
        canvasRef.current = document.getElementById("canvas");
        sourceNodeRef.current = document.getElementById(source);
        targetNodeRef.current = document.getElementById(target);

        updatePath();

    }, [source, target, updatePath]);

    const handleKeydown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Delete" || e.key === "Backspace") {
        removeEdge(id);
        }
    }, [id]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeydown);
        return () => {
        document.removeEventListener("keydown", handleKeydown);
        };
    }, [handleKeydown]);

    return (
        <svg
        id={id}
        className="edge"
        data-id={id}
        style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
        }}
        >
        <defs>
            <mask id={`${id}-mask`}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
                ref={maskRectRef}
                rx="100px"
                ry="100px"
                width="30"
                height="30"
                fill="black"
            />
            </mask>
        </defs>
        <path ref={edgeHitboxRef} className="path-hitbox" />
        <path
            ref={edgePathRef}
            className="edge-path"
            mask={`url(#${id}-mask)`}
        />
        <text
            ref={textRef}
            className="edge-text"
            textAnchor="middle"
            dominantBaseline="middle"
        >
            {id}
        </text>
        </svg>
    );
}