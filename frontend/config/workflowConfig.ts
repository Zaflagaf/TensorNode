// (import) bibliotheques externes
import React from "react";

// (import) type
import { EdgeType } from "../schemas/edge";
import { NodeType } from "../schemas/node";

// (import) parts
import {
  initialEdges,
  initialNodes,
  nodeRegistry,
  typeColors,
} from "./data/data";

type WorkflowType = {
  initialEdges: Record<string, EdgeType>;
  initialNodes: Record<string, NodeType>;
  nodeRegistry: Record<
    string,
    React.MemoExoticComponent<React.ComponentType<any>>
  >;
  typeColors: Record<string, string>;
  zoomLimits: {min: number, max: number}
};

export const workflowConfig: WorkflowType = {
  initialEdges: initialEdges,
  initialNodes: initialNodes,
  nodeRegistry: nodeRegistry,
  typeColors: typeColors,
  zoomLimits: {min: 0.1, max: 5}
};
