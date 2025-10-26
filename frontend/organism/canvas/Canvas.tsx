"use client";

// (import) bibliotheques externes
import React from "react";

// (import) useStores
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";

import { useEdgesStore } from "../edge/store/edgesStore";

// (import) parts
import {
  initialEdges,
  initialNodes,
  nodeRegistry,
} from "@/frontend/config/data/data";
import WorkflowEmpty from "../../components/ui/workflow-interface/empty/Empty";
import WorkflowEdge from "../edge/Edge";
import WorkflowPendingEdge from "../pending-edge/PendingEdge";
import { usePendingEdgeStore } from "../pending-edge/store/pendingEdgeStore";
import WorkflowPrimitiveCanvas from "./PrimitiveCanvas";
import { useLayersStore } from "./store/layersStore";

// -------------------------------------------- Nodes -------------------------------------------- //
const NodeWrapper = React.memo(({ nodeId }: { nodeId: string }) => {
  const node = useNodesStore((state) => state.nodes[nodeId]);
  const NodeComponent = nodeRegistry[node.type];

  return <NodeComponent node={node} />;
});

const NodesWrapper = React.memo(() => {
  const currentLayerId = useLayersStore((state) => state.currentLayer);
  if (!currentLayerId) return;

  const nodes = useNodesStore((state) => state.nodes);
  const nodeIds = React.useMemo(() => Object.keys(nodes), [nodes]);

  const currentLayer = useLayersStore((state) => state.layers[currentLayerId]);

  return (
    <>
      {nodeIds.map((nodeId, key) => {
        if (!currentLayer.content.includes(nodeId)) return;
        return <NodeWrapper key={key} nodeId={nodeId} />;
      })}
    </>
  );
});

// -------------------------------------------- Edges --------------------------------------------  //
const EdgeWrapper = React.memo(({ edgeId }: { edgeId: string }) => {
  const edge = useEdgesStore((state) => state.edges[edgeId]);

  return <WorkflowEdge edge={edge} />;
});

const EdgesWrapper = React.memo(() => {
  const currentLayerId = useLayersStore((state) => state.currentLayer);
  if (!currentLayerId) return;

  const edges = useEdgesStore((state) => state.edges);
  const edgeIds = React.useMemo(() => Object.keys(edges), [edges]);

  const currentLayer = useLayersStore((state) => state.layers[currentLayerId]);

  return (
    <>
      {edgeIds.map((edgeId) => {
        const sourceNode = edges[edgeId].source.nodeId;
        const targetNode = edges[edgeId].target.nodeId;

        if (
          !currentLayer.content.includes(sourceNode) ||
          !currentLayer.content.includes(targetNode)
        )
          return;

        return <EdgeWrapper key={edgeId} edgeId={edgeId} />;
      })}
    </>
  );
});

// -------------------------------------------- Connection --------------------------------------------  //
const PendingEdgeWrapper = () => {
  const pendingEdge = usePendingEdgeStore((state) => state.pendingEdge);

  return pendingEdge && <WorkflowPendingEdge pendingEdge={pendingEdge} />;
};

// -------------------------------------------- Workflow --------------------------------------------  //
const WorkflowCanvas = () => {
  const setNodes = useNodesStore((state) => state.actions.setNodes);
  const setEdges = useEdgesStore((state) => state.actions.setEdges);
  const currentLayer = useLayersStore((state) => state.currentLayer);

  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  return (
    <div className="w-full h-full overflow-hidden bg-background">
      {currentLayer ? (
        <WorkflowPrimitiveCanvas>
          <EdgesWrapper />
          <NodesWrapper />
          <PendingEdgeWrapper />
        </WorkflowPrimitiveCanvas>
      ) : (
        <WorkflowEmpty />
      )}
      {/*       <Tools tools={{ focus: true, fps: true, transform: true, copy: true }} /> */}
      {/*       <Minimap /> */}
    </div>
  );
};

export default WorkflowCanvas;
