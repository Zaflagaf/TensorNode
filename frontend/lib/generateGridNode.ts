import { NodeType } from "../schemas/node";

function generateGridNodes(cols: number, rows: number, spacing = 100): Record<string, NodeType> {
  const nodes: Record<string, NodeType> = {};
  let counter = 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = `n${counter}`;
      nodes[id] = {
        id,
        position: { x: col * spacing, y: row * spacing },
        selected: false,
        type: "test",
        content: {
          name: `Node ${counter}`,
          ports: { inputs: {}, outputs: {} },
        },
      };
      counter++;
    }
  }

  return nodes;
}

export default generateGridNodes