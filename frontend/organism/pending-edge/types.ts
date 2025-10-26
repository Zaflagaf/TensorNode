export interface PendingEdge {
  nodeId: string;
  handleId: string;
}

export type PendingEdgeStore = {
  pendingEdge: PendingEdge | null;
  actions: {
    setPendingEdge: (pendingEdge: PendingEdge | null) => void;
  };
};