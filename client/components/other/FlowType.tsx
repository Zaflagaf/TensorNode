interface Position {
    x: number;
    y: number;
}
  
interface NodeValues {
    input?: Record<string, any>;
    output?: Record<string, any>;
}
  
interface NodeData {
    label: string;
    values: NodeValues;
}
  
interface Node {
    id: string;
    position: Position;
    type: string;
    isActive: boolean;
    data: NodeData;
}

interface Edge {
    id: string;
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
    type?: string;
    data?: {
        id: string;
        label: string;
        values: Record<string, any>;
    };
}

interface NodeChange {

}

interface EdgeChange {

}

interface Connection {
    source: string;
    target: string;
    sourceHandle: string | null;
    targetHandle: string | null;
}

export type {Node, Edge, NodeChange, EdgeChange, Connection}