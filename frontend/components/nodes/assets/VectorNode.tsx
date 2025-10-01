import { useEffect, useState } from "react";

import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";

import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowVector from "../layouts/Vector";

// Helper pour générer un ID unique
const generateId = () => Math.random().toString(36).substring(2, 9);

type VectorItem = {
  id: string;
  value: number;
};

const VectorNodeComponent = ({ node }: { node: NodeType }) => {
  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  const [vector, setVector] = useState<number[]>(
    node.content.ports.outputs.data
  );

  useEffect(() => {
    setNodeOutput(node.id, "data", [vector]);
  }, [vector]);

  return (
    <WorkflowNode node={node}>
      <div className="vector">
        <WorkflowHead
          label={"Vector"}
          className={"from-node-head-data-from-gradient to-node-head-data-to-gradient"}
        />
        <WorkflowBody>
          <WorkflowHandle type="source" id="h1" port="data" node={node}>
            <WorkflowDefault label="vector" />
          </WorkflowHandle>
          <WorkflowVector vector={vector} setVector={setVector} type="float"/>
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
};

export default VectorNodeComponent;
