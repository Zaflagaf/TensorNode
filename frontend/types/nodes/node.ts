import { Handles, HandleStates, IconKeys, Position } from "@/frontend/types";

export type NodeType =
  | "flatten"
  | "activation"
  | "dense"
  | "conv2d"
  | "conv2dTranspose"
  | "model"
  | "table"
  | "input"
  | "tensor"
  | "latentVector"
  | "scaling"
  | "labelEncoding"
  | "batchNormalization"
  | "output"
  | "reshape"
  | "dropout"
  | "lossFunction"
  | "concatenate"
  | "fill"
  | "score"
  | "math"
  | "images"
  | "viewer"
  | "test";

export interface NodeContent {
  icon?: IconKeys;
  name: string;
  color?: string | null;
  description?: string | null;
  ports: {
    inputs: Handles;
    outputs: Handles;
  };
}

export interface Node {
  id: string;
  type: NodeType;
  box: {
    position: Position;
    width?: number;
    height?: number;
  };
  content: NodeContent;
}

export interface NodeComponent {
  node: Node;
}
export type Nodes = Record<string, Node>;

export interface NodesStore {
  nodes: Record<string, Node>;
  selectedNodes: string[];
  problematicNodes: string[];
  actions: {
    getNodes: () => Record<string, Node>;

    setNodes: (nodes: Record<string, Node>) => void;
    setNode: (nodeId: string, node: Node) => void;
    addNode: (nodeId: string, node: any) => void;
    removeNodes: (nodeIds: string[]) => void;

    setNodePos: (nodeId: string, x: number, y: number) => void;
    setNodeBounds: (nodeId: string, width: number, height: number) => void;

    addSelectedNodes: (nodeIds: string[]) => void;

    setNodeInput: (nodeId: string, handleId: string, input: any) => void;
    setNodeOutput: (nodeId: string, handleId: string, output: any) => void;
    setHandleState: (
      nodeId: string,
      handleType: "inputs" | "outputs",
      handleId: string,
      state: keyof HandleStates,
      value: boolean
    ) => void;
  };
}
