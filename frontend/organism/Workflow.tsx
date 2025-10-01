"use client";

// (import) bibliotheques externes
import React from "react";

// (import) hooks

// (import) useStores
import { useNodesStore } from "@/frontend/store/nodesStore";
import { useConnectionStore } from "../store/connectionsStore";
import { useEdgesStore } from "../store/edgesStore";

// (import) utils
import { workflowConfig } from "../config/workflowConfig";

// (import) parts
import Minimap from "../components/dev/Minimap";
import { addPopUp } from "../components/dev/Popup";
import Tools from "../components/dev/Tools";
import WorkflowCanvas from "./Canvas";
import WorkflowConnection from "./Connection";
import WorkflowEdge from "./Edge";

// -------------------------------------------- Nodes -------------------------------------------- //

// SECTION Nodes Wrapper Component
const NodeWrapper = React.memo(({ id }: { id: string }) => {
  const node = useNodesStore((state) => state.nodes[id]); // selector par node
  const NodeComponent = workflowConfig.nodeRegistry[node.type];
  return <NodeComponent node={node} />;
});

const NodesWrapper = React.memo(() => {
  const nodes = useNodesStore((state) => state.nodes);
  const nodeIds = React.useMemo(() => Object.keys(nodes), [nodes]);

  return (
    <>
      {nodeIds.map((id) => (
        <NodeWrapper key={id} id={id} />
      ))}
    </>
  );
});
// !SECTION Nodes Wrapper Component

// -------------------------------------------- Edges --------------------------------------------  //

// SECTION Edges Wrapper Component
const EdgeWrapper = React.memo(({ id }: { id: string }) => {
  const edge = useEdgesStore((state) => state.edges[id]); // selector par edge
  return <WorkflowEdge edge={edge} />;
});

const EdgesWrapper = React.memo(() => {
  const edges = useEdgesStore((state) => state.edges);
  const edgeIds = React.useMemo(() => Object.keys(edges), [edges]);

  return (
    <>
      {edgeIds.map((id) => (
        <EdgeWrapper key={id} id={id} />
      ))}
    </>
  );
});
// !SECTION Edges Wrapper Component

// -------------------------------------------- Connection --------------------------------------------  //

// SECTION Connections Wrapper Component
const ConnectionWrapper = () => {
  const connection = useConnectionStore((state) => state.connection);

  return connection && <WorkflowConnection connection={connection} />;
};
// !SECTION Connections Wrapper Component

// -------------------------------------------- Workflow --------------------------------------------  //

// SECTION Workflow Component
const WorkflowComponent = () => {
  const setNodes = useNodesStore((state) => state.actions.setNodes);
  const setEdges = useEdgesStore((state) => state.actions.setEdges);

  React.useEffect(() => {
    setNodes(workflowConfig.initialNodes);
    setEdges(workflowConfig.initialEdges);

    addPopUp({
      header: "Workflow",
      body: "Workflow Initalisé avec succé, les nodes et les edges sont opérationnels",
      statut: "success",
    });
  }, []);

  return (
    <div className="w-full h-full overflow-hidden bg-canvas">
      <WorkflowCanvas>
        <EdgesWrapper />
        <NodesWrapper />
        <ConnectionWrapper />
      </WorkflowCanvas>
      <Tools tools={{ focus: true, fps: true, transform: true, copy: true }} />
      <Minimap />
      {/*       <PopUps /> */}
    </div>
  );
};

const Workflow = React.memo(WorkflowComponent);
// !SECTION Workflow Component

export default Workflow;
