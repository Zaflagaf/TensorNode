"use client";
import { useFlowContext } from "@/context/FlowContext";
import { useZoom } from "@/context/ZoomContext";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

function CanvasTransformation({
    children,
    trigger,
}: {
    children: React.ReactNode;
    trigger: string;
}) {

    const { setZoom, defaultZoom } = useZoom()
    const { editorRef } = useFlowContext()
    const [scale, setScale] = React.useState(defaultZoom);
    
    const draggableRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [pivotPoint, setPivotPoint] = React.useState<{ x: number; y: number } | null>(null);
    const [defaultPositionState, setDefaultPositionState] = React.useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const requestRef = useRef<number>(0);


    useLayoutEffect(() => {
        triggerRef.current = draggableRef.current?.querySelector(trigger) as HTMLDivElement;
        const containerElement = document.getElementById("editor") as HTMLDivElement;
        const containerBound = containerElement?.getBoundingClientRect();
        if (containerBound && editorRef.current) {
            const editorBound = editorRef.current.getBoundingClientRect()
            const midX = (containerBound.width / 2 - draggableRef.current!.offsetWidth / 2 + editorBound.width / 2)*scale;
            const midY = (containerBound.height / 2 - draggableRef.current!.offsetHeight / 2 + editorBound.height / 2)*scale;
            setPosition({ x: midX, y: midY });
            setDefaultPositionState({ x: midX, y: midY }); 
        }
    }, [editorRef.current]);

    const handleWheel = (e: React.WheelEvent) => {
        
        e.preventDefault();
        const canvas = draggableRef.current;
        const editor = document.getElementById("editor") as HTMLDivElement;

        if (canvas && editor && defaultPositionState && !isDragging && draggableRef.current) {
            const canvasRect = canvas.getBoundingClientRect();
            const editorRect = editor.getBoundingClientRect();

            const Px = editorRect.width / 2 + editorRect.x;
            const Py = editorRect.height / 2 + editorRect.y;

            const offsetX = (Px - canvasRect.left) / scale;
            const offsetY = (Py - canvasRect.top) / scale;

            const zoomFactor = 0.1;
            const deltaY = e.deltaY > 0 ? -zoomFactor : zoomFactor;


            const newScale = Math.min(Math.max(scale + deltaY, 0.1), 2);

            setPosition((prevPosition) => ({
                x: prevPosition.x - offsetX * (newScale - scale),
                y: prevPosition.y - offsetY * (newScale - scale),
            }));

            setScale(newScale);

            //draggableRef.current.style.transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 1) return;
        
        const draggable = draggableRef.current;
        if (
            !draggable ||
            (e.target !== triggerRef.current) ||
            (e.target as HTMLElement)?.closest(".undraggable") 
        ) {
            return;
        }

        const rect = draggable.getBoundingClientRect();
        const x = e.clientX - rect.x;
        const y = e.clientY - rect.y;
        setPivotPoint({ x, y });
        setIsDragging(true);
    };

    const updatePosition = useCallback((e: MouseEvent) => {
        const draggable = draggableRef.current;
        if (!draggable) return;

        setPosition((prevPosition) => {
            if (pivotPoint && isDragging) {
                const x = prevPosition.x + (e.clientX - pivotPoint!.x - draggable.getBoundingClientRect().x);
                const y = prevPosition.y + (e.clientY - pivotPoint!.y - draggable.getBoundingClientRect().y);
                return { x, y };
            } else {
                return prevPosition;
            }
        });
    }, [pivotPoint]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(() => updatePosition(e));
    }, [updatePosition]);

    const handleMouseUp = () => {
        setIsDragging(false);
        setPivotPoint(null);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [pivotPoint]);

    useLayoutEffect(() => setZoom(scale), [scale])

    return (
        <div
            className="draggable"
            ref={draggableRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            style={{
                position: "absolute",
                width: "fit-content",
                height: "fit-content",
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: "0 0",
            }}
        >
            {children}
        </div>
    );
}

export default CanvasTransformation