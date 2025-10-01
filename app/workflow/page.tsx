"use client";
import { MLContextMenu } from "@/frontend/components/other/ContextMenu";
import { createDefaultNode } from "@/frontend/lib/defaultNodes";
import { getWorkflowTransformedPoint } from "@/frontend/lib/getWorkflowTransformedPoint";
import Workflow from "@/frontend/organism/Workflow";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { useWorkflowStore } from "@/frontend/store/workflowStore";
import { useZoomStore } from "@/frontend/store/zoomStore";
import { useEffect } from "react";

export default function WorkflowPage() {
  const addNode = useNodesStore((state) => state.actions.addNode);
  const transform = useZoomStore((state) => state.transform);
  const workflow = useWorkflowStore((state) => state.workflow);
  const zoom = useZoomStore((state) => state.zoom);

/*   useEffect(() => {
    function applySystemTheme() {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.classList.toggle("dark", prefersDark);
      document.documentElement.classList.toggle("light", !prefersDark);
    }

    // 1. Applique immédiatement au chargement
    applySystemTheme();

    // 2. Écoute les changements du système en temps réel
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", applySystemTheme);
  }, []); */

  return (
    <div className="w-screen h-screen bg-black">
      <MLContextMenu
        onSelect={(item, category, e) => {
          if (!workflow.current) return;

          const position = getWorkflowTransformedPoint(
            { width: 1, height: 1, left: e.clientX, top: e.clientY },
            workflow.current,
            zoom,
            transform
          );
          const id = `${"n"}-${Math.random().toString(36).substr(2, 9)}`;

          const node = createDefaultNode(
            item.toLowerCase() as any,
            { x: 0, y: 0 },
            id
          );

          addNode(id, node);
        }}
      >
        <Workflow />
      </MLContextMenu>
    </div>
  );
}
