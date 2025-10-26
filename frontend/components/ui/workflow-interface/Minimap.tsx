"use client";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";

const Minimap = () => {
  const nodes = useNodesStore((state) => state.nodes);
  // const edges = useEdgesStore((state) => state.edges) // Plus besoin

  const nodeValues = Object.values(nodes);

  if (nodeValues.length === 0) {
    return;
  }

  // Calculer le bounding box réel de tous les nodes
  const minX = Math.min(...nodeValues.map((node) => node.box.position.x));
  const minY = Math.min(...nodeValues.map((node) => node.box.position.y));
  const maxX = Math.max(
    ...nodeValues.map((node) => node.box.position.x + (node.box.width || 50))
  );
  const maxY = Math.max(
    ...nodeValues.map((node) => node.box.position.y + (node.box.height || 50))
  );

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  const miniWidth = 200;
  const miniHeight = 200;
  const padding = 10;

  const scale = Math.min(
    (miniWidth - 2 * padding) / contentWidth,
    (miniHeight - 2 * padding) / contentHeight
  );

  const normalize = (value: number, isX: boolean) => {
    const offset = isX ? minX : minY;
    return (value - offset) * scale + padding;
  };

  return (
    <div className="bg-node-from-gradient/50 p-2 w-[220px] h-[220px] absolute bottom-5 right-5 rounded-md border-node-outline border backdrop-blur-sm">
      {/* Nodes uniquement */}
      {Object.values(nodes).map((node) => {
        const nodeWidth = (node.box.width || 50) * scale;
        const nodeHeight = (node.box.height || 50) * scale;

        const posX = normalize(node.box.position.x, true);
        const posY = normalize(node.box.position.y, false);

        return (
          <div
            key={node.id}
            className="absolute border rounded-xs bg-gradient-to-br from-node-from-gradient to-node-to-gradient border-node-outline"
            style={{
              width: `${nodeWidth}px`,
              height: `${nodeHeight}px`,
              top: `${posY}px`,
              left: `${posX}px`,
            }}
            title={`${node.id} (${node.type})`}
          ></div>
        );
      })}
    </div>
  );
};

export default Minimap;
