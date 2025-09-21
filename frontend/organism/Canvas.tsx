"use client"

import type React from "react"

import * as d3 from "d3"
import { useRef, useCallback } from "react"
import { workflowConfig } from "../config/workflowConfig"
import useOnInit from "../hooks/useOnInit"
import { useWorkflowStore } from "../store/workflowStore"
import { useZoomStore } from "../store/zoomStore"

import useCleverPropagation from "../hooks/useCleverPropagation"

const WorkflowCanvas = ({ children }: { children: React.ReactNode }) => {
  const setWorkflow = useWorkflowStore((state) => state.actions.setWorkflow)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)

  const animationFrameRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(0)
  const storeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const zoomLimits = workflowConfig.zoomLimits

  const setZoom = useZoomStore((state) => state.actions.setZoom)
  const setTransform = useZoomStore((state) => state.actions.setTransform)
  const setZoomBehavior = useZoomStore((state) => state.actions.setZoomBehavior)

  useCleverPropagation()

  const updateBackgroundPattern = useCallback((transform: d3.ZoomTransform) => {
    if (!bgRef.current) return

    const worldX = transform.x
    const worldY = transform.y
    const cycle = Math.log2(transform.k)
    const fract = cycle % 1
    const base = 15
    const spacing = base * Math.pow(2, fract)
    const radius = spacing * 0.1
    const posX = ((worldX % spacing) + spacing) % spacing
    const posY = ((worldY % spacing) + spacing) % spacing

    // Batch DOM updates
    const bgElement = bgRef.current
    bgElement.style.backgroundImage = `radial-gradient(circle ${radius}px, rgb(230,230,230) 100%, transparent 100%)`
    bgElement.style.backgroundSize = `${spacing}px ${spacing}px`
    bgElement.style.backgroundPosition = `${posX}px ${posY}px`
  }, [])

  const updateStores = useCallback(
    (transform: d3.ZoomTransform) => {
      if (storeUpdateTimeoutRef.current) {
        clearTimeout(storeUpdateTimeoutRef.current)
      }

      storeUpdateTimeoutRef.current = setTimeout(() => {
        setZoom(transform.k)
        setTransform({ x: transform.x, y: transform.y, k: transform.k })
      }, 16) // ~60fps throttling
    },
    [setZoom, setTransform],
  )

  const handleZoom = useCallback(
    (event: d3.D3ZoomEvent<HTMLDivElement, unknown>) => {
      const { transform } = event
      const now = performance.now()

      // Cancel previous animation frame if still pending
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Throttle to ~120fps for smooth performance
      if (now - lastUpdateRef.current < 8) {
        animationFrameRef.current = requestAnimationFrame(() => {
          handleZoom(event)
        })
        return
      }

      lastUpdateRef.current = now

      // Immediate transform update for smooth visual feedback
      if (contentRef.current) {
        contentRef.current.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`
      }

      // Batch background and store updates
      animationFrameRef.current = requestAnimationFrame(() => {
        updateBackgroundPattern(transform)
        updateStores(transform)
      })
    },
    [updateBackgroundPattern, updateStores],
  )

  useOnInit(() => {
    if (!containerRef.current || !contentRef.current || !bgRef.current) return

    setWorkflow(containerRef.current)

    const container = d3.select(containerRef.current)
    const content = d3.select(contentRef.current)

    // Création du zoom
    const zoom = d3
      .zoom<HTMLDivElement, unknown>()
      .scaleExtent([zoomLimits.min, zoomLimits.max])
      .filter((event) => {
        const target = event.target as HTMLElement
        // Ignore les handles ou éléments interactifs React
        return !target.closest(".handle")
      })
      .on("zoom", handleZoom)

    // Appliquer le zoom
    setZoomBehavior(zoom)
    container.call(zoom as any)

    // Reset transform
    container.call((sel: any) => zoom.transform(sel, d3.zoomIdentity))

    return () => {
      container.on(".zoom", null)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (storeUpdateTimeoutRef.current) {
        clearTimeout(storeUpdateTimeoutRef.current)
      }
    }
  })

  return (
    <div ref={containerRef} id="canvas" className="relative w-full h-full overflow-hidden" style={{ cursor: "grab" }}>
      <div ref={bgRef} className="absolute top-0 left-0 w-full h-full bg-repeat" />
      <div ref={contentRef} className="absolute top-0 left-0">
        {children}
      </div>
    </div>
  )
}

export default WorkflowCanvas