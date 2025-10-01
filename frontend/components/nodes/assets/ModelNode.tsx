"use client";

// (import) bibliotheques externes

// (import) hooks
import React, { useState } from "react";

// (import) ui

// (import) icons

// (import) types
import { NodeType } from "@/frontend/schemas/node";

// (import) parts
import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";

// (import) utils
import { useEdgesStore } from "@/frontend/store/edgesStore";
import { useNodesStore } from "@/frontend/store/nodesStore";

// Status types for button state
import { ButtonStatus } from "@/frontend/schemas/types/general";

import { buildModel } from "@/frontend/services/api";
import WorkflowBody from "../layouts/Body";
import WorkflowButton from "../layouts/Button";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowTable from "../layouts/Table";

const getCurrentGraph = () => {
  return {
    nodes: useNodesStore.getState().nodes,
    edges: useEdgesStore.getState().edges,
  };
};

const ModelNodeComponent = React.memo(({ node }: { node: NodeType }) => {
  const [architecture, setArchitecture] = useState<any>([
    { layer: "N/A", output: "N/A", params: "N/A" },
  ]);

  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  const handleClick = async () => {
    setButtonStatus("loading");

    const { nodes, edges } = getCurrentGraph();

    // Build model
    const modelArch = await buildModel(nodes, edges, node.id, setButtonStatus);
    console.log(modelArch);

    setArchitecture(modelArch);
  };

  // TODO Rajouter message défilant dessus node afin de savoir ce qui est fetch exemple: n4 construit avec succés !
  return (
    <WorkflowNode node={node}>
      <div>
        <WorkflowHead
          label={"Model"}
          className="from-node-head-model-from-gradient to-node-head-model-to-gradient"
        />

        <WorkflowBody>
          <WorkflowHandle type="source" id="h1" port="model" node={node}>
            <WorkflowDefault label="Model" />
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h2" port="layer" node={node}>
            <WorkflowDefault label="Layer" />
          </WorkflowHandle>
          <WorkflowButton
            label="build"
            onClick={handleClick}
            status={buttonStatus}
          />
          <WorkflowTable data={architecture} />
        </WorkflowBody>

        {/*         <ArchitectureTable node={node} /> */}
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
});

export default ModelNodeComponent;
