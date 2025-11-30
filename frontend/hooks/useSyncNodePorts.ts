import { Node } from "@/frontend/types";
import { useEffect, useState } from "react";
import { useNodesStore } from "../store/nodesStore";

/**
 * Synchronise les valeurs d’un node avec le store Zustand (version à jour)
 * et garde un état local stable pour les inputs / outputs.
 */
export function useSyncNodePorts(initialNode: Node) {
  // 🔹 on récupère le node "vivant" depuis le store
  const liveNode = useNodesStore((state) => state.nodes[initialNode.id]);

  const [inputs, setInputs] = useState<Record<string, any>>(
    structuredClone(liveNode.content.ports.inputs)
  );
  const [outputs, setOutputs] = useState<Record<string, any>>(
    structuredClone(liveNode.content.ports.outputs)
  );

  // 🔹 Synchronisation des inputs
  useEffect(() => {
    const nextInputs = liveNode.content.ports.inputs;
    setInputs((prev) => {
      const changed = Object.entries(nextInputs).some(
        ([key, value]) =>
          JSON.stringify(prev[key]?.value) !== JSON.stringify(value.value)
      );
      return changed ? structuredClone(nextInputs) : prev;
    });
  }, [liveNode.content.ports.inputs]);

  // 🔹 Synchronisation des outputs
  useEffect(() => {
    const nextOutputs = liveNode.content.ports.outputs;
    setOutputs((prev) => {
      const changed = Object.entries(nextOutputs).some(
        ([key, value]) =>
          JSON.stringify(prev[key]?.value) !== JSON.stringify(value.value)
      );
      return changed ? structuredClone(nextOutputs) : prev;
    });
  }, [liveNode.content.ports.outputs]);

  // 🔹 Refresh manuel (utile après setNodeOutput)
  const refresh = () => {
    const node = useNodesStore.getState().nodes[initialNode.id];
    setInputs(structuredClone(node.content.ports.inputs));
    setOutputs(structuredClone(node.content.ports.outputs));
  };

  return { inputs, outputs, refresh, node: liveNode };
}

export default useSyncNodePorts;
