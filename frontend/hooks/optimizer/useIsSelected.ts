import { useNodesStore } from "@/frontend/store/nodesStore";

export default function useIsSelected(nodeId: string) {
  return useNodesStore((state) => state.selectedNodes.includes(nodeId));
}
