import { useNodesStore } from "@/frontend/store/nodesStore";

export default function getType(id: string, handle: string, dir: "inputs" | "outputs") {
  const nodes = useNodesStore.getState().nodes;
  return nodes[id]?.content?.ports?.[dir]?.[handle]?.type ?? "default";
};
