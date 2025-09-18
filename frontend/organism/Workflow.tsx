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
import PopUps, { addPopUp } from "../components/dev/Popup";
import Tools from "../components/dev/Tools";
import WorkflowCanvas from "./Canvas";
import WorkflowConnection from "./Connection";
import WorkflowEdge from "./Edge";
import Minimap from "./tools/Minimap";

// SECTION Nodes Wrapper Component
const NodesWrapperComponent = () => {
  const nodes = useNodesStore((state) => state.nodes);

  return (
    <>
      {Object.entries(nodes).map(([key, node]) => {
        const NodeComponent = workflowConfig.nodeRegistry[node.type];
        return <NodeComponent key={key} node={node} />;
      })}
    </>
  );
};

const NodesWrapper = React.memo(NodesWrapperComponent);
// !SECTION Nodes Wrapper Component

// SECTION Edges Wrapper Component
const EdgesWrapperComponent = () => {
  const edges = useEdgesStore((state) => state.edges);

  return (
    <>
      {Object.entries(edges).map(([key, edge]) => {
        return <WorkflowEdge key={key} edge={edge} />;
      })}
    </>
  );
};

const EdgesWrapper = React.memo(EdgesWrapperComponent);
// !SECTION Edges Wrapper Component

// SECTION Edges Wrapper Component
const ConnectionWrapperComponent = () => {
  const connection = useConnectionStore((state) => state.connection);

  return connection && <WorkflowConnection connection={connection} />;
};

const ConnectionWrapper = React.memo(ConnectionWrapperComponent);
// !SECTION Edges Wrapper Component

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
    <div className="w-full h-full">
      <WorkflowCanvas>
        <NodesWrapper />
        <EdgesWrapper />
        <ConnectionWrapper />
      </WorkflowCanvas>
      <Tools tools={{ focus: true, fps: true, transform: true }} />
      <Minimap />
      <PopUps />
    </div>
  );
};

const Workflow = React.memo(WorkflowComponent);
// !SECTION Workflow Component

export default Workflow;
