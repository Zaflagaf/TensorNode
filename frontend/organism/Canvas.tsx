"use client";

import type React from "react";

import * as d3 from "d3";
import { useCallback, useEffect, useRef } from "react";
import { workflowConfig } from "../config/workflowConfig";
import useOnInit from "../hooks/useOnInit";
import { useWorkflowStore } from "../store/workflowStore";
import { useZoomStore } from "../store/zoomStore";

import useCleverPropagation from "../hooks/useCleverPropagation";
import { useEdgesStore } from "../store/edgesStore";
import { useNodesStore } from "../store/nodesStore";

const WorkflowCanvas = ({ children }: { children: React.ReactNode }) => {
  const setWorkflow = useWorkflowStore((state) => state.actions.setWorkflow);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const storeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const zoomLimits = workflowConfig.zoomLimits;

  const setZoom = useZoomStore((state) => state.actions.setZoom);
  const setTransform = useZoomStore((state) => state.actions.setTransform);
  const setZoomBehavior = useZoomStore(
    (state) => state.actions.setZoomBehavior
  );

  const clearSelectedEdge = useEdgesStore(
    (state) => state.actions.clearSelectedEdge
  );
  const clearSelectedNode = useNodesStore(
    (state) => state.actions.clearSelectedNode
  );
  const freezeTransformClassName = useWorkflowStore(
    (state) => state.freezeTransformClassName
  );

  useCleverPropagation();

  const updateBackgroundPattern = useCallback((transform: d3.ZoomTransform) => {
    if (!bgRef.current) return;

    const worldX = transform.x;
    const worldY = transform.y;
    const cycle = Math.log2(transform.k);
    const fract = cycle % 1;
    const base = 15;
    const spacing = base * Math.pow(2, fract);
    const radius = spacing * 0.1;
    const posX = ((worldX % spacing) + spacing) % spacing;
    const posY = ((worldY % spacing) + spacing) % spacing;

    // Batch DOM updates
    const bgElement = bgRef.current;

    // Gradient radial dynamique
    bgElement.style.backgroundImage = `radial-gradient(circle ${
      radius / 3
    }px, var(--color-canvas-dot) 100%, transparent 100%)`;

    // Taille et position
    bgElement.style.backgroundSize = `${spacing}px ${spacing}px`;
    bgElement.style.backgroundPosition = `${posX}px ${posY}px`;
  }, []);

  const updateStores = useCallback(
    (transform: d3.ZoomTransform) => {
      if (storeUpdateTimeoutRef.current) {
        clearTimeout(storeUpdateTimeoutRef.current);
      }

      storeUpdateTimeoutRef.current = setTimeout(() => {
        setZoom(transform.k);
        setTransform({ x: transform.x, y: transform.y, k: transform.k });
      }, 16); // ~60fps throttling
    },
    [setZoom, setTransform]
  );

  const handleZoom = useCallback(
    (event: d3.D3ZoomEvent<HTMLDivElement, unknown>) => {
      const { transform } = event;
      const now = performance.now();

      // Cancel previous animation frame if still pending
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Throttle to ~120fps for smooth performance
      if (now - lastUpdateRef.current < 8) {
        animationFrameRef.current = requestAnimationFrame(() => {
          handleZoom(event);
        });
        return;
      }

      lastUpdateRef.current = now;

      // Immediate transform update for smooth visual feedback
      if (contentRef.current) {
        contentRef.current.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
      }

      // Batch background and store updates
      animationFrameRef.current = requestAnimationFrame(() => {
        updateBackgroundPattern(transform);
        updateStores(transform);
      });
    },
    [updateBackgroundPattern, updateStores]
  );

  useOnInit(() => {
    if (!containerRef.current || !contentRef.current || !bgRef.current) return;

    setWorkflow(containerRef.current);

    const container = d3.select(containerRef.current);
    const content = d3.select(contentRef.current);

    // Création du zoom
    const zoom = d3
      .zoom<HTMLDivElement, unknown>()
      .scaleExtent([zoomLimits.min, zoomLimits.max])
      .filter((event) => {
        const target = event.target as HTMLElement;
        // Ignore les handles ou éléments interactifs React

        return !freezeTransformClassName.canvas.some((cls) =>
          target.closest("." + cls)
        );
      })
      .on("zoom", handleZoom);

    // Appliquer le zoom
    setZoomBehavior(zoom);
    container.call(zoom as any);

    // Reset transform
    container.call((sel: any) => zoom.transform(sel, d3.zoomIdentity));

    return () => {
      container.on(".zoom", null);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (storeUpdateTimeoutRef.current) {
        clearTimeout(storeUpdateTimeoutRef.current);
      }
    };
  });

  {
    /* nettoie les selecteds edges et nodes quand c'est clické ailleurs */
  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        containerRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;

        // Si on ne clique pas sur un edge
        if (!target.closest("path")) {
          clearSelectedEdge();
        }

        // Si on ne clique pas sur un node (ni lui, ni un de ses enfants)
        if (!target.closest(".node")) {
          clearSelectedNode();
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [containerRef, clearSelectedEdge, clearSelectedNode]);

  return (
    <div
      ref={containerRef}
      id="canvas"
      className="relative w-full h-full overflow-hidden "
    >
      <div
        ref={bgRef}
        className="absolute top-0 left-0 w-full h-full bg-repeat"
      />
      <div ref={contentRef} className="absolute top-0 left-0">
        {children}
      </div>
    </div>
  );
};

export default WorkflowCanvas;
