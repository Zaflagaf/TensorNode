import { Box, Segment } from "@/frontend/types";

export enum EdgeHandle {
  inputs = "inputs",
  outputs = "outputs",
}

export interface EdgeGeometry extends Box, Segment {
  isValid?: boolean;
}

export interface EdgeStates {
  selected: boolean;
}

export interface Edge {
  id: string;

  source: {
    nodeId: string;
    handleId: string;
  };
  target: {
    nodeId: string;
    handleId: string;
  };

  states: EdgeStates;
}

export interface EdgeComponent {
  edge: Edge;
}

export type Edges = Record<string, Edge>;

export interface EdgesStore {
  edges: Record<string, Edge>;
  actions: {
    setEdges: (edges: Record<string, Edge>) => void;
    setEdge: (edgeId: string, edge: Edge) => void;
    addEdge: (
      edgeId: string,
      source: {
        nodeId: string;
        handleId: string;
      },
      target: {
        nodeId: string;
        handleId: string;
      }
    ) => void;
    removeEdge: (edgeId: string) => void;
    removeEdgeRelativeToNodes: (nodeIds: string[]) => void;
    removeEdgeRelativeToNodeAndTargetHandle: (
      nodeId: string,
      handleId: string
    ) => void;

    setSelectedEdge: (edgeId: string, value?: boolean) => void;
  };
}
