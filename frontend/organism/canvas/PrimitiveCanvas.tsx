"use client";

import * as d3 from "d3";
import { useCallback, useEffect, useRef } from "react";

import propagatePorts from "../../lib/propagatePorts";
import { useEdgesStore } from "../edge/store/edgesStore";
import { useNodesStore } from "../node/store/nodesStore";
import { useWorkflowStore } from "./store/workflowStore";
import { useZoomStore } from "./store/zoomStore";

function useBackgroundPattern(bgRef: React.RefObject<HTMLDivElement | null>) {
  return useCallback((transform: d3.ZoomTransform) => {
    const bg = bgRef.current;
    if (!bg) return;

    const { x, y, k } = transform;
    const cycle = Math.log2(k);
    const fract = cycle % 1;
    const base = 50;
    const spacing = base * Math.pow(2, fract);
    const radius = spacing * 0.075;
    const posX = ((x % spacing) + spacing) % spacing;
    const posY = ((y % spacing) + spacing) % spacing;

    bg.style.backgroundImage = `radial-gradient(circle ${
      radius / 3
    }px, var(--color-secondary) 100%, transparent 100%)`;
    bg.style.backgroundSize = `${spacing}px ${spacing}px`;
    bg.style.backgroundPosition = `${posX}px ${posY}px`;
  }, []);
}

function useZoomStoresUpdater(setTransform: any) {
  const storeUpdateRef = useRef<number | null>(null);

  const updateStores = useCallback(
    (transform: d3.ZoomTransform) => {
      if (storeUpdateRef.current) {
        cancelAnimationFrame(storeUpdateRef.current);
      }

      storeUpdateRef.current = requestAnimationFrame(() => {
        setTransform({ x: transform.x, y: transform.y, k: transform.k });
      });
    },
    [setTransform]
  );

  useEffect(() => {
    return () => {
      if (storeUpdateRef.current) cancelAnimationFrame(storeUpdateRef.current);
    };
  }, []);

  return updateStores;
}

const WorkflowPrimitiveCanvas = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const workflowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const zoomLimits = useZoomStore((state) => state.zoomLimits);
  const selectionAreaRef = useRef<SVGSVGElement | null>(null);

  const setWorkflow = useWorkflowStore((state) => state.actions.setWorkflow);
  const { setTransform, setZoomBehavior } = useZoomStore((state) => state.actions);
  const { setSelectedEdge } = useEdgesStore((state) => state.actions);
  const { setSelectedNode } = useNodesStore((state) => state.actions);
  const freezeTransformClassName = useWorkflowStore(
    (state) => state.freezeTransformClassName
  );
  const updateBackgroundPattern = useBackgroundPattern(bgRef);
  const updateStores = useZoomStoresUpdater(setTransform);

  useEffect(() => {
    const nds = propagatePorts();
    if (nds) {
      useNodesStore.getState().actions.setNodes(nds);
    }
  }, []);

  /** Gestion du zoom fluide */
  const handleZoom = useCallback(
    (e: d3.D3ZoomEvent<HTMLDivElement, unknown>) => {
      const { transform } = e;
      const now = performance.now();

      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);

      if (now - lastUpdateRef.current < 8) {
        animationFrameRef.current = requestAnimationFrame(() =>
          handleZoom(e)
        );
        return;
      }
      lastUpdateRef.current = now;

      if (contentRef.current) {
        contentRef.current.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
      }

      updateBackgroundPattern(transform);

      animationFrameRef.current = requestAnimationFrame(() => {
        updateStores(transform);
      });
    },
    [updateBackgroundPattern, updateStores]
  );

  /** Initialisation du zoom */
  useEffect(() => {
    if (!workflowRef.current) return;
    setWorkflow(workflowRef.current);

    const container = d3.select(workflowRef.current);
    const zoom = d3
      .zoom<HTMLDivElement, unknown>()
      .scaleExtent([zoomLimits.min, zoomLimits.max])
      .filter((e) => {
        const target = e.target as HTMLElement;

        if (e.ctrlKey) return false;

        // autoriser le pinch/trackpad zoom
        if (e.type === "wheel" && e.ctrlKey) return true;

        // Bloquer zoom si dans zone freeze
        if (
          freezeTransformClassName.canvas.some((cls) =>
            target.closest("." + cls)
          )
        )
          return false;

        // Autoriser le mousedown gauche
        return e.type !== "mousedown" || e.button === 0;
      })
      .on("zoom", handleZoom);

    setZoomBehavior(zoom);
    container.call(zoom as any);
    container.call((sel: any) => zoom.transform(sel, d3.zoomIdentity));

    return () => {
      container.on(".zoom", null);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    handleZoom,
    setWorkflow,
    setZoomBehavior,
    freezeTransformClassName,
    zoomLimits,
  ]);

  /** Gestion des clics sur le canvas (mousedown natif) */
  useEffect(() => {
    const el = workflowRef.current;
    if (!el) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!el.contains(target)) return;

      if (!target.closest("path")) setSelectedEdge("", false);
      if (!target.closest(".node")) setSelectedNode("", false);
    };

    el.addEventListener("mousedown", handleMouseDown, { capture: true });
    return () =>
      el.removeEventListener("mousedown", handleMouseDown, { capture: true });
  }, [setSelectedEdge, setSelectedNode]);

  /** Gestion du brush (Ctrl + Drag) */
  useEffect(() => {
    const el = workflowRef.current;
    const svg = selectionAreaRef.current;
    if (!el || !svg) return;

    let isBrushing = false;
    let startX = 0;
    let startY = 0;

    // Créer le rectangle si pas déjà créé
    let rect = svg.querySelector("rect") as SVGRectElement | null;
    if (!rect) {
      rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("fill", "white");
      rect.setAttribute("fill-opacity", "0.05");
      rect.setAttribute("stroke", "white");
      rect.setAttribute("stroke-dasharray", "8 2");
      rect.setAttribute("stroke-width", "1");
      rect.setAttribute("visibility", "hidden");
      svg.appendChild(rect);
    }

    const onMouseDown = (e: MouseEvent) => {
      if (!e.ctrlKey || e.button !== 0) return;

      isBrushing = true;
      const rectEl = svg.getBoundingClientRect();
      startX = e.clientX - rectEl.left;
      startY = e.clientY - rectEl.top;

      rect.setAttribute("x", startX.toString());
      rect.setAttribute("y", startY.toString());
      rect.setAttribute("width", "0");
      rect.setAttribute("height", "0");
      rect.setAttribute("visibility", "visible");
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isBrushing) return;

      const rectEl = svg.getBoundingClientRect();
      const x = e.clientX - rectEl.left;
      const y = e.clientY - rectEl.top;

      const width = Math.abs(x - startX);
      const height = Math.abs(y - startY);

      rect.setAttribute("x", Math.min(x, startX).toString());
      rect.setAttribute("y", Math.min(y, startY).toString());
      rect.setAttribute("width", width.toString());
      rect.setAttribute("height", height.toString());
    };

    const onMouseUp = () => {
      if (!isBrushing) return;
      isBrushing = false;
      rect.setAttribute("visibility", "hidden");
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);
  /** Render */
  return (
    <div
      ref={workflowRef}
      id="canvas"
      className="relative w-full h-full overflow-hidden"
    >
      <div ref={bgRef} className="absolute inset-0 bg-repeat" />
      <div ref={contentRef} className="absolute top-0 left-0">
        {children}
      </div>
      <svg
        ref={selectionAreaRef}
        className="absolute w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default WorkflowPrimitiveCanvas;
