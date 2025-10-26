import { Nodes } from "@/frontend/types";
import { current, produce } from "immer";
import { useEdgesStore } from "../organism/edge/store/edgesStore";
import { useNodesStore } from "../organism/node/store/nodesStore";

const propagatePorts = (): Nodes | undefined => {
  let hasChanged = false;

  const nodes = useNodesStore.getState().nodes;
  const edges = useEdgesStore.getState().edges;

  const updatedNodes = produce(nodes, (draft) => {
    Object.values(edges).forEach((edge) => {
      const sourceNode = draft[edge.source.nodeId];
      const targetNode = draft[edge.target.nodeId];

      if (!sourceNode || !targetNode) return;

      const sourceHandle =
        sourceNode.content.ports.outputs[edge.source.handleId];
      const targetHandle =
        targetNode.content.ports.inputs[edge.target.handleId];

      if (!sourceHandle || !targetHandle) return;

      const sourceHandleCurrent = current(sourceNode.content.ports.outputs);
      const targetHandleCurrent = current(targetNode.content.ports.inputs);

      const sourceHandleValue = sourceHandleCurrent[edge.source.handleId].value;
      const targetHandleValue = targetHandleCurrent[edge.target.handleId].value;

      
      if (sourceHandleValue !== targetHandleValue) {
        targetHandle.states.isBusy = !targetHandle.states.isBusy
        targetHandle.value = sourceHandleValue;
        
        hasChanged = true;
      }
    });
  });

  return hasChanged ? updatedNodes : undefined;
};

export default propagatePorts;
