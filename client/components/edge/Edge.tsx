"use client";
import { useFlowContext } from "@/context/FlowContext";
import { useZoom } from "@/context/ZoomContext";
import React, { useEffect, useLayoutEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import "./edge.scss";

const EdgeComponent = forwardRef(({ id, source, target, sourceHandle, targetHandle,}: 
    {
        id: string;
        source: string;
        target: string;
        sourceHandle: string;
        targetHandle: string;
    }, ref) => {

    const { zoom } = useZoom();
    const { removeEdge, activeEdge, canvasRef } = useFlowContext();

    const edgePathRef = useRef<SVGPathElement | null>(null);
    const edgeHitboxRef = useRef<SVGPathElement | null>(null);
    const sourceNodeRef = useRef<HTMLElement | null>(null);
    const targetNodeRef = useRef<HTMLElement | null>(null);

    const startRef = useRef<{ x: number; y: number } | null>(null);
    const endRef = useRef<{ x: number; y: number } | null>(null);

    useImperativeHandle(ref, () => ({
        updatePath
    }));

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

        if (!hasStartChanged && !hasEndChanged) return;

        startRef.current = { x: nextStartX, y: nextStartY };
        endRef.current = { x: nextEndX, y: nextEndY };

        const path = `M ${nextStartX} ${nextStartY} C ${(nextStartX + nextEndX) / 2} ${nextStartY}, ${(nextStartX + nextEndX) / 2} ${nextEndY}, ${nextEndX} ${nextEndY}`;

        edgePathRef.current?.setAttribute("d", path);
        edgeHitboxRef.current?.setAttribute("d", path);

    }, [zoom]);

    useLayoutEffect(() => {
        sourceNodeRef.current = document.getElementById(source);
        targetNodeRef.current = document.getElementById(target);
    }, [source, target]);

    const handleKeydown = useCallback((e: KeyboardEvent) => {

        if (e.key === "Delete" || e.key === "Backspace" && activeEdge === id) {
            e.preventDefault();
            removeEdge(id);
        }

    },[removeEdge, id, activeEdge] );

    useEffect(() => {
        document.addEventListener("keydown", handleKeydown);
        return () => document.removeEventListener("keydown", handleKeydown);
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
            <path ref={edgeHitboxRef} className="path-hitbox" />
            <path ref={edgePathRef} className="edge-path" mask={`url(#${id}-mask)`} style={{ stroke: activeEdge == id? "rgb(179, 0, 255)" : ""}}/>
        </svg>
    );
})

export default EdgeComponent;