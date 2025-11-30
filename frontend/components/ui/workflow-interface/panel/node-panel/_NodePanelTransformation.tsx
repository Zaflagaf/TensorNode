import propagatePorts from "@/frontend/lib/node&edge-logic/propagatePorts";
import { useEdgesStore } from "@/frontend/store/edgesStore";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { useWorkflowStore } from "@/frontend/store/workflowStore";
import { useZoomStore } from "@/frontend/store/zoomStore";
import * as d3 from "d3";
import { useCallback, useEffect, useRef } from "react";

const WorkflowNodePanelTransformation = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /** Refs DOM */
  const workflowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<SVGSVGElement>(null);
  const frameRef = useRef<number | null>(null);
  const mode = useWorkflowStore((state) => state.mode);
  /** Stores */
  const zoomLimits = useZoomStore((s) => s.zoomLimits);
  const { setTransform, setZoomBehavior } = useZoomStore((s) => s.actions);
  const transform = useZoomStore((state) => state.transform);
  const { setWorkflow } = useWorkflowStore((s) => s.actions);
  const freezeTransform = useWorkflowStore((s) => s.freezeTransformClassName);

  const { setSelectedEdge } = useEdgesStore((s) => s.actions);
  const { setNodes } = useNodesStore((s) => s.actions);

  // ---------------------------------------------------------------------------
  // Background grid pattern
  // ---------------------------------------------------------------------------
  // 3. Update useCallback to accept isCtrlPressed
  const updateBackground = useCallback(
    (t: d3.ZoomTransform) => {
      const bg = bgRef.current;

      const isGrid = mode === "grid";
      if (!bg) return;

      if (isGrid) {
        const minorSize = 25;
        const majorSize = 250;
        const minorSpacing = minorSize * t.k;
        const majorSpacing = majorSize * t.k;

        const majorLineColor = "rgba(155, 155,155,0.075)";
        const minorLineColor = "rgba(155, 155, 155, 0.05)";

        const minorOffsetX = t.x % minorSpacing;
        const minorOffsetY = t.y % minorSpacing;
        const majorOffsetX = t.x % majorSpacing;
        const majorOffsetY = t.y % majorSpacing;

        const backgroundImage = [
          `linear-gradient(to right, ${majorLineColor} 1px, transparent 1px)`,
          `linear-gradient(to bottom, ${majorLineColor} 1px, transparent 1px)`,
          `linear-gradient(to right, ${minorLineColor} 1px, transparent 1px)`,
          `linear-gradient(to bottom, ${minorLineColor} 1px, transparent 1px)`,
        ].join(", ");

        const backgroundSize = [
          `${majorSpacing}px ${majorSpacing}px`,
          `${majorSpacing}px ${majorSpacing}px`,
          `${minorSpacing}px ${minorSpacing}px`,
          `${minorSpacing}px ${minorSpacing}px`,
        ].join(", ");

        const backgroundPosition = [
          `${majorOffsetX}px ${majorOffsetY}px`,
          `${majorOffsetX}px ${majorOffsetY}px`,
          `${minorOffsetX}px ${minorOffsetY}px`,
          `${minorOffsetX}px ${minorOffsetY}px`,
        ].join(", ");

        bg.style.backgroundImage = backgroundImage;
        bg.style.backgroundSize = backgroundSize;
        bg.style.backgroundPosition = backgroundPosition;
      } else {
        const baseSpacing = 50;
        const radiusRatio = 0.15 / 2;
        const gradientScale = 3;
        const spacing = baseSpacing * t.k;
        const radius = spacing * radiusRatio;
        const offsetX = t.x % spacing;
        const offsetY = t.y % spacing;

        bg.style.backgroundImage = `radial-gradient(circle ${
          radius / gradientScale
        }px, var(--color-secondary) 100%, transparent 100%)`;
        bg.style.backgroundSize = `${spacing}px ${spacing}px`;
        bg.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
      }
    },
    [mode]
  );

  // 4. Update the call site in handleZoom
  const handleZoom = useCallback(
    (e: d3.D3ZoomEvent<HTMLDivElement, unknown>) => {
      const t = e.transform;
      if (!contentRef.current) return;

      contentRef.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${t.k})`;
      updateBackground({ ...t } as unknown as d3.ZoomTransform); // Pass the current Ctrl state

      // throttle transform updates with requestAnimationFrame
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => setTransform(t));
    },
    [setTransform, updateBackground]
  );

  useEffect(() => {
    if (!contentRef.current) return;
    contentRef.current.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`;
  }, [transform]);

  useEffect(() => {
    updateBackground({ ...transform } as d3.ZoomTransform);
  }, [transform, updateBackground]);

  // ---------------------------------------------------------------------------
  // Initialize D3 Zoom
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const workflow = workflowRef.current;
    if (!workflow) return;

    setWorkflow(workflow);
    const container = d3.select(workflow);

    const zoom = d3
      .zoom<HTMLDivElement, unknown>()
      .scaleExtent([zoomLimits.min, zoomLimits.max])
      .filter((e) => {
        const target = e.target as HTMLElement;

        // Disable zoom for specific UI elements
        if (e.ctrlKey) return false; // D3 prevents pan/zoom on Ctrl+Click/Drag
        if (e.type === "wheel" && e.ctrlKey) return true; // Allows Ctrl+Wheel zoom

        const blocked = freezeTransform.canvas.some((cls) =>
          target.closest("." + cls)
        );
        if (blocked) return false;

        return e.type !== "mousedown" || e.button === 0;
      })
      .on("zoom", handleZoom);

    setZoomBehavior(zoom);
    /* container.call(zoom as any).call((s) => zoom.transform(s, d3.zoomIdentity)); */

    const currentTransform = transform
      ? d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k)
      : d3.zoomIdentity;

    container
      .call(zoom as any)
      .call((s) => zoom.transform(s, currentTransform));

    // 7. Initial background update on mount
    updateBackground(currentTransform);

    return () => {
      container.on(".zoom", null);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [
    handleZoom,
    setWorkflow,
    setZoomBehavior,
    freezeTransform,
    zoomLimits,
    updateBackground,
  ]); // Add updateBackground dependency

  // ---------------------------------------------------------------------------
  // Auto propagate ports (1st render only)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const nodes = useNodesStore.getState().nodes;
    const edges = useEdgesStore.getState().edges;
    setNodes(propagatePorts(nodes, edges));
  }, [setNodes]);

  // ---------------------------------------------------------------------------
  // Clear selection when clicking empty space
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const el = workflowRef.current;
    if (!el) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) return;
      if (!(e.target as HTMLElement).closest("path"))
        setSelectedEdge("", false);
      if (!(e.target as HTMLElement).closest(".node"))
        useNodesStore.setState({ selectedNodes: [] });
    };

    el.addEventListener("mousedown", handleMouseDown, { capture: true });
    return () =>
      el.removeEventListener("mousedown", handleMouseDown, { capture: true });
  }, [setSelectedEdge]);

  // ---------------------------------------------------------------------------
  // Brush Selection (Ctrl + Drag)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const el = workflowRef.current;
    const svg = selectionRef.current;
    if (!el || !svg) return;

    let brushing = false;
    let startX = 0,
      startY = 0;

    const rect =
      (svg.querySelector("rect") as SVGRectElement) ??
      (() => {
        const r = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        );
        Object.assign(r, {
          fill: "white",
          stroke: "white",
          visibility: "hidden",
        });
        r.setAttribute("fill-opacity", "0.05");
        r.setAttribute("stroke-dasharray", "8 2");
        r.setAttribute("stroke-width", "1");
        svg.appendChild(r);
        return r;
      })();

    const onMouseDown = (e: MouseEvent) => {
      if (!e.ctrlKey || e.button !== 0) return;
      brushing = true;
      const rectEl = svg.getBoundingClientRect();
      startX = e.clientX - rectEl.left;
      startY = e.clientY - rectEl.top;
      Object.assign(rect, {
        x: startX,
        y: startY,
        width: 0,
        height: 0,
        visibility: "visible",
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!brushing) return;
      const rectEl = svg.getBoundingClientRect();
      const x = e.clientX - rectEl.left;
      const y = e.clientY - rectEl.top;
      rect.setAttribute("x", Math.min(x, startX).toString());
      rect.setAttribute("y", Math.min(y, startY).toString());
      rect.setAttribute("width", Math.abs(x - startX).toString());
      rect.setAttribute("height", Math.abs(y - startY).toString());
    };

    const onMouseUp = () => {
      brushing = false;
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
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
        ref={selectionRef}
        className="absolute w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default WorkflowNodePanelTransformation;
