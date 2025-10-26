import { Handles, HandleStates, Position } from "@/frontend/types";

export type NodeType =
  | "flatten"
  | "activation"
  | "dense"
  | "conv2d"
  | "conv2dTranspose"
  | "model"
  | "compile" // deprecated
  | "excel"
  | "input"
  | "fit" // deprecated
  | "tensor"
  | "kaggle"
  | "latentVector"
  | "predict" // deprecated
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
  | "images";

export interface NodeContent {
  name: string;
  ports: {
    inputs: Handles;
    outputs: Handles;
  };
}

export interface NodeStates {
  selected: boolean;
  dragged: boolean;
  error?: boolean;
}

export interface Node {
  id: string;
  type: NodeType;
  box: {
    position: Position;
    width?: number;
    height?: number;
  };
  states: NodeStates;
  content: NodeContent;
}

export type Nodes = Record<string, Node>;

export interface NodesStore {
  nodes: Record<string, Node>;
  actions: {
    getNodes: () => Record<string, Node>;

    setNodes: (nodes: Record<string, Node>) => void;
    setNode: (nodeId: string, node: Node) => void;
    addNode: (nodeId: string, node: any) => void;
    removeNode: (nodeId: string) => void;

    setNodePos: (nodeId: string, x: number, y: number) => void;
    setNodeBounds: (nodeId: string, width: number, height: number) => void;

    setSelectedNode: (nodeId: string, value?: boolean) => void;

    setNodeInput: (nodeId: string, handleId: string, input: any) => void;
    setNodeOutput: (nodeId: string, handleId: string, output: any) => void;
    setHandleState: (
      nodeId: string,
      handleType: "inputs" | "outputs",
      handleId: string,
      state: keyof HandleStates,
      value: boolean
    ) => void;
    setNodeState: (
      nodeId: string,
      state: keyof NodeStates,
      value: boolean
    ) => void;
  };
}
