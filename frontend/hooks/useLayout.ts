"use client";
import { useEffect } from "react";
import { NodeType } from "../schemas/node";
import { useNodesStore } from "../store/nodesStore";

const useLayout = (node: NodeType, props: Record<string, any>) => {
  const setNodeInput = useNodesStore((state) => state.actions.setNodeInput);

  useEffect(() => {
    Object.entries(props).forEach(([key, value]) => {


      if (value !== node.content.ports.inputs[key]) {
        setNodeInput(node.id, key, value);
      }
    });
  }, [props]);
};

export default useLayout