import { useCallback, useEffect, useState } from "react";
import { Node } from "../components/other/FlowType";

function useNodesState(initialNodes: Node[]) {
  const [nodes, setNodes] = useState<Record<string, Node>>(() => {
    const initialDict: Record<string, Node> = {};
    initialNodes.forEach((node) => {
      initialDict[node.id] = node;
    });
    return initialDict;
  });

  useEffect(() => {
    setNodes(() => {
      const updatedDict: Record<string, Node> = {};
      initialNodes.forEach((node) => {
        updatedDict[node.id] = node;
      });
      return updatedDict;
    });
  }, [initialNodes]);

  const nodeToFront = useCallback((nodeId: string) => {
    setNodes((nds) => {
      if (!nds[nodeId]) return nds;
      const { [nodeId]: node, ...rest } = nds;
      return { ...rest, [nodeId]: node };
    });
  }, []);

  return [nodes, setNodes, nodeToFront] as const;
}

export default useNodesState;
