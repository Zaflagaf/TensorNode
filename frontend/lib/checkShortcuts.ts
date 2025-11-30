import { SHORTCUTS } from "@/frontend/config/settings";
import { useLayersStore } from "@/frontend/store/layersStore";
import { useMouseStore } from "@/frontend/store/mouse-store/mouse-store";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { Node } from "@/frontend/types";
import { getTransformedPoint } from "@/frontend/utils/get/getTransformedPoint";
import { produce } from "immer";
import { useEdgesStore } from "../store/edgesStore";
import { useWorkflowStore } from "../store/workflowStore";
import { createId } from "../utils/create/createId";

export default function checkShortcuts(
  container: HTMLElement | null | undefined,
  e: KeyboardEvent
) {
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const ctrlPressed = isMac ? e.metaKey : e.ctrlKey;

  const keybinding =
    SHORTCUTS.find(
      (kb) =>
        kb.key.toLowerCase() === e.key.toLowerCase() &&
        !!kb.ctrl === ctrlPressed &&
        !!kb.shift === e.shiftKey &&
        !!kb.alt === e.altKey
    ) || null;

  if (!keybinding) return;

  const nodesStore = useNodesStore.getState();
  const layersStore = useLayersStore.getState();
  const mouseStore = useMouseStore.getState();

  switch (keybinding.action) {
    case "copy": {
      useWorkflowStore.setState((state) => ({
        clipboard: {
          ...state.clipboard,
          nodes: nodesStore.selectedNodes
            .map((id) => produce(nodesStore.nodes[id], (d) => d))
            .filter(Boolean) as Node[],
        },
      }));
      break;
    }

    case "paste": {
      const clipboard = useWorkflowStore.getState().clipboard;
      if (clipboard.nodes.length === 0) return;

      const addNode = nodesStore.actions.addNode;
      const addNodeToLayer = layersStore.actions.addNodeToLayer;
      const currentLayer = layersStore.currentLayer;

      if (!currentLayer || !container) return;

      const mousePosition = getTransformedPoint(
        mouseStore.mousePosition,
        container
      );

      clipboard.nodes.forEach((originalNode: Node) => {
        const nodeId = createId();

        const newNode = produce(originalNode, (draft: Node) => {
          draft.id = nodeId;
          draft.box.position = mousePosition;
        });

        addNode(nodeId, newNode);
        addNodeToLayer(currentLayer, nodeId);
      });
      break;
    }

    case "cut": {
      const selectedNodeIds = [...nodesStore.selectedNodes];
      const removeNodes = nodesStore.actions.removeNodes;
      const removeNodeFromLayer = layersStore.actions.removeNodesFromLayer;
      const currentLayer = layersStore.currentLayer;

      if (!currentLayer) return;
      
      useWorkflowStore.setState((state) => ({
        clipboard: {
          ...state.clipboard,
          nodes: nodesStore.selectedNodes
            .map((id) => produce(nodesStore.nodes[id], (d) => d))
            .filter(Boolean) as Node[],
        },
      }));

      removeNodes(selectedNodeIds);
      removeNodeFromLayer(currentLayer, selectedNodeIds);

      break;
    }
    case "grid": {
      const mode = useWorkflowStore.getState().mode;
      const isGrid = mode === "grid";
      useWorkflowStore.setState({ mode: isGrid ? "free" : "grid" });
      break;
    }
    case "delete": {
      const active = document.activeElement;
      if (
        active &&
        active instanceof HTMLElement &&
        active.classList.contains("undeletable")
      ) {
        return;
      }

      const removeNodes = useNodesStore.getState().actions.removeNodes;
      const removeNodesFromLayer =
        useLayersStore.getState().actions.removeNodesFromLayer;
      const removeEdgeRelativeToNodes =
        useEdgesStore.getState().actions.removeEdgeRelativeToNodes;

      const selectedNodeIds = useNodesStore.getState().selectedNodes;
      const currentLayer = useLayersStore.getState().currentLayer;

      if (!currentLayer) return;

      removeNodes(selectedNodeIds);
      removeEdgeRelativeToNodes(selectedNodeIds);
      removeNodesFromLayer(currentLayer, selectedNodeIds);
      break;
    }
  }
}
