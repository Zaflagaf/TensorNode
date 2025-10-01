"use client";

// (import) bibliotheques externes
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

// (import) hooks
import useId from "../hooks/useId";

// (import) useStores
import { useWorkflowStore } from "../store/workflowStore";
import { useZoomStore } from "../store/zoomStore";

// (import) types
import { ConnectionType } from "../schemas/connection";

// (import) utils
import { workflowConfig } from "../config/workflowConfig";
import { getWorkflowTransformedPoint } from "../lib/getWorkflowTransformedPoint";
import { useConnectionStore } from "../store/connectionsStore";
import { useEdgesStore } from "../store/edgesStore";

function WorkflowConnection({
  connection,
}: {
  connection: ConnectionType | null;
}) {
  const connectionId = useId();
  const [path, setPath] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  const workflow = useWorkflowStore((state) => state.workflow);
  const zoomRef = useZoomStore((state) => state.zoomRef);
  const transformRef = useZoomStore((state) => state.transformRef);
  const setConnection = useConnectionStore(
    (state) => state.actions.setConnection
  );
  const addEdge = useEdgesStore((state) => state.actions.addEdge);

  const handleRef = useRef<HTMLDivElement | null>(null);
  const [handleData, setHandleData] = useState<{
    port: string | null;
    node: string | null;
    type: string | null;
  }>({ port: null, node: null, type: null });

  const typeColors = workflowConfig.typeColors;

  const getColor = (type?: string) =>
    type ? typeColors[type] || typeColors.default : typeColors.default;

  useEffect(() => {
    if (!connection || !workflow.current) return;

    const nodeElement = workflow.current.querySelector(
      "#" + connection.sourceNode
    );
    const handleElement = nodeElement?.querySelector(
      "#" + connection.sourceHandle
    );

    if (!handleElement) return;

    handleRef.current = handleElement as HTMLDivElement | null;
    const port = handleElement.getAttribute("data-port");
    const node = handleElement.getAttribute("data-node");
    const type = handleElement.getAttribute("data-type");
    setHandleData({ port, node, type });
  }, [connection, workflow]);

  useEffect(() => {
    if (!handleRef.current || !workflow.current) return;

    const handleMouseMove = (event: MouseEvent) => {
      const box = handleRef.current!.getBoundingClientRect();

      if (!workflow.current || !zoomRef.current || !transformRef.current)
        return;

      const pos = getWorkflowTransformedPoint(
        box,
        workflow.current,
        zoomRef.current,
        transformRef.current
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
          workflow.current,
          zoomRef.current,
          transformRef.current
        );
        if (!p) return;

        targetPos = p;
      } else {
        const [x, y] = d3.pointer(event, workflow.current);

        targetPos = {
          x: (x - transformRef.current.x) / transformRef.current.k,
          y: (y - transformRef.current.y) / transformRef.current.k,
        };
      }

      setPath({
        x1: pos.x,
        y1: pos.y,
        x2: targetPos.x,
        y2: targetPos.y,
      });
    };

    const handleMouseUp = (event: MouseEvent) => {
      let target = event.target as HTMLElement | null;
      if (!target || !connection) return;

      // On s'intéresse uniquement aux handles
      if (
        !target.classList.contains("handle") &&
        !target.classList.contains("clip-handle")
      ) {
        setConnection(null);
        return;
      }

      // Si c'est un clip-handle, remonte au parent .handle
      if (target.classList.contains("clip-handle")) {
        target = target.closest<HTMLElement>(".handle");
        if (!target) {
          setConnection(null);
          return;
        }
      }

      const id = target.getAttribute("id");
      const node = target.getAttribute("data-node");
      const type = target.getAttribute("data-type");

      if (!id || !node || !type) {
        setConnection(null);
        return;
      }

      addEdge(
        connectionId,
        connection.sourceNode,
        connection.sourceHandle,
        node,
        id
      );

      setConnection(null);
    };

    workflow.current.addEventListener("mousemove", handleMouseMove);
    workflow.current.addEventListener("mouseup", handleMouseUp);
    return () => {
      workflow.current?.removeEventListener("mousemove", handleMouseMove);
      workflow.current?.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleRef, workflow, zoomRef, transformRef]);

  const fromColor = getColor(handleData.port ?? "");

  const left = Math.min(path.x1, path.x2);
  const top = Math.min(path.y1, path.y2);
  const width = Math.abs(path.x2 - path.x1);
  const height = Math.abs(path.y2 - path.y1);

  return (
    connection && (
      <svg
        id={connectionId}
        className="absolute pointer-events-none connection"
        style={{
          left,
          top,
          width,
          height,
        }}
      >
        <line
          x1={path.x1 < path.x2 ? 0 : width}
          y1={path.y1 < path.y2 ? 0 : height}
          x2={path.x1 < path.x2 ? width : 0}
          y2={path.y1 < path.y2 ? height : 0}
          className="stroke-2 stroke-neutral-500 stroke"
          strokeLinecap="round"
        />
      </svg>
    )
  );
}

export default WorkflowConnection;
