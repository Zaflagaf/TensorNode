"use client";

// (import) bibliotheques externes
import React from "react";

// (import) useStores
import { useNodesStore } from "@/frontend/store/nodesStore";

import { useEdgesStore } from "../../../../../store/edgesStore";

// (import) parts
import { nodeRegistry } from "@/frontend/config/data/data";
import useKeybindings from "@/frontend/hooks/aggregator/use-keybindings";
import useMouse from "@/frontend/hooks/aggregator/use-mouse";
import { useWorkflowStore } from "@/frontend/store/workflowStore";
import { useZoomStore } from "@/frontend/store/zoomStore";
import { findLayer, useLayersStore } from "../../../../../store/layersStore";
import { usePendingEdgeStore } from "../../../../../store/pendingEdgeStore";
import WorkflowEdge from "../../../../edge/Edge";
import WorkflowPendingEdge from "../../../../pending-edge/PendingEdge";
import WorkflowContextMenu from "../../general/ContextMenu";
import WorkflowEmpty from "./Empty";
import WorkflowNodePanelTransformation from "./_NodePanelTransformation";
import TopTabs from "./top-panel/TopTabs";
import { getWorkflowTransformedPoint } from "@/frontend/lib/getWorkflowTransformedPoint";
import { createId } from "@/frontend/utils/create/createId";
import { createDefaultNode } from "@/frontend/lib/node&edge-logic/defaultNodes";

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

  const currentLayer = useLayersStore((state) =>
    findLayer(state.layers, currentLayerId)
  );

  return (
    <>
      {nodeIds.map((nodeId) => {
        if (!currentLayer || !currentLayer.content.includes(nodeId)) return;
        return <NodeWrapper key={nodeId} nodeId={nodeId} />;
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

  const currentLayer = useLayersStore((state) =>
    findLayer(state.layers, currentLayerId)
  );

  return (
    <>
      {edgeIds.map((edgeId) => {
        const sourceNode = edges[edgeId].source.nodeId;
        const targetNode = edges[edgeId].target.nodeId;

        if (
          !currentLayer ||
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
const WorkflowNodePanel = () => {
  const currentLayer = useLayersStore((state) => state.currentLayer);
  const selectedNodes = useNodesStore((state) => state.selectedNodes);

  const addNode = useNodesStore((state) => state.actions.addNode);
  const addNodeToLayer = useLayersStore(
    (state) => state.actions.addNodeToLayer
  );
  const transform = useZoomStore((state) => state.transform);
  const workflow = useWorkflowStore((state) => state.workflow);

  useKeybindings();
  useMouse();

  return (
    <div className="w-full h-full bg-background overflow-hidden">
      {currentLayer ? (
        <WorkflowContextMenu
          onSelect={(mousePos, item) => {
            if (!currentLayer) return;
            const type = item.type;

            if (!workflow.current) return;

            const position = getWorkflowTransformedPoint(
              { width: 1, height: 1, left: mousePos.x, top: mousePos.y },
              workflow.current,
              transform
            );
            const id = createId();

            const node = createDefaultNode(
              type,
              position as { x: number; y: number },
              id
            );

            addNode(id, node);
            addNodeToLayer(currentLayer, id);
          }}
        >
          <TopTabs />
          <div className="relative h-full w-full">
            {selectedNodes.length > 0 && (
              <div className="absolute top-0 left-0 text-xxs text-muted-foreground p-1">
                {">"} {selectedNodes}
              </div>
            )}
            <WorkflowNodePanelTransformation>
              <EdgesWrapper />
              <NodesWrapper />
              <PendingEdgeWrapper />
            </WorkflowNodePanelTransformation>
          </div>
        </WorkflowContextMenu>
      ) : (
        <WorkflowEmpty />
      )}
    </div>
  );
};
export default WorkflowNodePanel;
