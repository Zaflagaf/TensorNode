"use client";

import WorkflowContextMenu from "@/frontend/components/ui/workflow-interface/ContextMenu";

import { createDefaultNode } from "@/frontend/lib/defaultNodes";
import { getWorkflowTransformedPoint } from "@/frontend/lib/getWorkflowTransformedPoint";
import { useLayersStore } from "@/frontend/organism/canvas/store/layersStore";
import { useWorkflowStore } from "@/frontend/organism/canvas/store/workflowStore";
import { useZoomStore } from "@/frontend/organism/canvas/store/zoomStore";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";

import WorkflowCanvas from "@/frontend/organism/canvas/Canvas";

/* import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react"; */

export default function WorkflowPage() {
  const currentLayer = useLayersStore((state) => state.currentLayer);

  /*   useEffect(() => {


    const startBackendAndConnect = async () => {
      try {
        // Appel de la commande Rust
        const result = await invoke("start_backend");

        // Vérifie si le backend a répondu avec succès
        console.log("Backend started successfully:", result);

        // Tu peux retourner true/false ou autre selon le besoin
        return true;
      } catch (error) {
        // Gestion d’erreur si la commande échoue
        console.error("Failed to start backend:", error);

        // Retourne false ou un objet avec plus d’infos
        return false;
      }
    };
    startBackendAndConnect();
  }, []); */

  const addNode = useNodesStore((state) => state.actions.addNode);
  const addNodeToLayer = useLayersStore(
    (state) => state.actions.addNodeToLayer
  );
  const transform = useZoomStore((state) => state.transform);
  const workflow = useWorkflowStore((state) => state.workflow);

  return (
    <main className="h-full w-full bg-black relative">
      <WorkflowContextMenu
        onSelect={(mousePos, item) => {
          if (!currentLayer) return;
          const type = item.type;

          if (!workflow.current) return;

          const position = getWorkflowTransformedPoint(
            { width: 1, height: 1, left: mousePos.x, top: mousePos.y },
            workflow.current,
            transform
          );
          const id = `${"n"}-${Math.random().toString(36).substr(2, 9)}`;

          const node = createDefaultNode(
            type,
            position as { x: number; y: number },
            id
          );

          addNode(id, node);
          addNodeToLayer(currentLayer, id);
          console.log(id);
        }}
      >
        <WorkflowCanvas />
      </WorkflowContextMenu>
    </main>
  );
}
