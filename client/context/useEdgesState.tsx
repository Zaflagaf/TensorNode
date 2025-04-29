import { useState } from "react";
import { Edge } from "../components/other/FlowType";

function useEdgesState(initialEdges: Edge[]): any {
  const [edges, setEdges] = useState<Record<string, Edge>>(() => {
    const initialDict: Record<string, Edge> = {};
    initialEdges.forEach((edge) => {
      initialDict[edge.id] = edge;
    });
    return initialDict;
  });

  return [edges, setEdges];
}

export default useEdgesState;
