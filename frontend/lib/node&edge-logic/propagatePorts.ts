import { Edges, Nodes } from "@/frontend/types";
import { current, produce } from "immer";

const propagatePorts = (nodes: Nodes, edges: Edges): Nodes => {
  let hasChanged = false;

  const updatedNodes: Nodes = produce(nodes, (draft) => {
    Object.values(edges).forEach((edge) => {
      const sourceNode = draft[edge.source.nodeId];
      const targetNode = draft[edge.target.nodeId];

      // Vérification de la validité des nœuds
      if (!sourceNode || !targetNode) return;

      const sourcePorts = sourceNode.content?.ports;
      const targetPorts = targetNode.content?.ports;

      // ⚠️ Si un des deux nœuds n’a pas de ports, on ignore
      if (!sourcePorts || !targetPorts) return;

      const sourceHandle = sourcePorts.outputs?.[edge.source.handleId];
      const targetHandle = targetPorts.inputs?.[edge.target.handleId];

      // ⚠️ Si les handles ne sont pas valides (pas dans les ports), on ne touche à rien
      if (!sourceHandle || !targetHandle) return;

      const sourceHandleCurrent = current(sourcePorts.outputs);
      const targetHandleCurrent = current(targetPorts.inputs);

      const sourceHandleValue =
        sourceHandleCurrent[edge.source.handleId]?.value;
      const targetHandleValue =
        targetHandleCurrent[edge.target.handleId]?.value;

      // ⚙️ Seulement si la valeur du port source diffère, on propage
      if (sourceHandleValue !== targetHandleValue) {
        targetHandle.value = sourceHandleValue;
        hasChanged = true;
      }
    });
  });

  // ✅ Ne retourne un nouvel état que s’il y a eu un vrai changement
  return hasChanged ? updatedNodes : nodes;
};

export default propagatePorts;
