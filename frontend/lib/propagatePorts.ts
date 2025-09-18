import { EdgeType } from "../schemas/edge";
import { NodeType } from "../schemas/node";

const propagatePorts = (
  nodes: Record<string, NodeType>,
  edges: Record<string, EdgeType>
): Record<string, NodeType> => {
  let hasChanged = false;
  const updatedNodes = { ...nodes };

  Object.values(edges).forEach((edge) => {
    const sourceNode = updatedNodes[edge.sourceNode];
    const targetNode = updatedNodes[edge.targetNode];

    if (!sourceNode || !targetNode) return;

    const sourceElement = document.getElementById(sourceNode.id);
    const targetElement = document.getElementById(targetNode.id);

    const sourceHandle = sourceElement?.querySelector(`#${edge.sourceHandle}`);
    const targetHandle = targetElement?.querySelector(`#${edge.targetHandle}`);

    const sourceKey = sourceHandle?.getAttribute("data-port");
    const targetKey = targetHandle?.getAttribute("data-port");

    if (
      sourceKey &&
      targetKey &&
      sourceNode.content.ports.outputs &&
      targetNode.content.ports.inputs
    ) {
      const newValue = sourceNode.content.ports.outputs[sourceKey];
      const currentValue = targetNode.content.ports.inputs[targetKey];

      if (newValue !== currentValue) {
        const newInput = {
          ...targetNode.content.ports.inputs,
          [targetKey]: newValue,
        };
        const newValues = { ...targetNode.content.ports, inputs: newInput };
        const newData = { ...targetNode.content, ports: newValues };
        const newTargetNode = { ...targetNode, content: newData };

        updatedNodes[edge.targetNode] = newTargetNode;
        hasChanged = true;
      }
    }
  });

  return hasChanged ? updatedNodes : nodes;
};

export default propagatePorts;
