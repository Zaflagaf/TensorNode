"use client";

import InitialPopup from "@/frontend/components/ui/workflow-interface/pop-up/InitialPopUp";
import Workflow from "@/frontend/components/workflow/Workflow";
import { useEdgesStore } from "@/frontend/store/edgesStore";
import { useLayersStore } from "@/frontend/store/layersStore";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { Edges } from "@/frontend/types";
import createDefaultWorkflow from "@/frontend/utils/create/createDefaultWorkflow";
import { useEffect } from "react";

/* const initialEdges: Edges = {};
const { initialNodes, initialLayers } = createDefaultWorkflow([
  {
    name: "Compositor",
    type: "compositor",
    content: [{ type: "score", position: { x: 500, y: 100 } }],
    children: [

    ],
  },      {
        name: "MLP",
        type: "model",
        content: [
          { type: "input", position: { x: -75, y: 0 } },
          { type: "dense", position: { x: 300, y: 0 } },
          { type: "dense", position: { x: 600, y: 0 } },
          { type: "dense", position: { x: 900, y: 0 } },
          { type: "output", position: { x: 1200, y: 0 } },
        ],
      },
]);
 */

export default function WorkflowPage() {
  /* const setNodes = useNodesStore((state) => state.actions.setNodes);
  const setEdges = useEdgesStore((state) => state.actions.setEdges);
  const setLayers = useLayersStore((state) => state.actions.setLayers);

  useEffect(() => {
    setNodes(initialNodes);
    setLayers(initialLayers);
    setEdges(initialEdges);
  }, []); */

  return (
    <main className="h-full w-full bg-black relative">
      <InitialPopup />
      <Workflow />
    </main>
  );
}
