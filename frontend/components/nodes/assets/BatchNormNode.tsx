"use client";

// (import) bibliotheques externes
import React from "react";

// (import) types
import { NodeType } from "@/frontend/schemas/node";

// (import) useStores

// (import) parts
import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";

// (import) layouts
import WorkflowHead from "../layouts/Header";

const BatchNormComponent = React.memo(({ node }: { node: NodeType }) => {
  return (
    <WorkflowNode node={node}>
      <div className="w-108">
        <WorkflowHead
          label="Couche de Normalisation par lot"
          className={"from-indigo-400 to-indigo-600"}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <WorkflowHandle type="source" id="h1" port="layer" node={node}>
            Layer
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h2" port="layer" node={node}>
            Layer
          </WorkflowHandle>
        </div>
      </div>
    </WorkflowNode>
  );
});

export default BatchNormComponent;
