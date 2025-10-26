"use client";
import { Node } from "@/frontend/types";
import { useEffect } from "react";
import propagatePorts from "../lib/propagatePorts";
import { useNodesStore } from "../organism/node/store/nodesStore";

const useLayout = (node: Node, props: Record<string, any>) => {
  const setNodeInput = useNodesStore((state) => state.actions.setNodeInput);

  useEffect(() => {
    setTimeout(() => {
      Object.entries(props).forEach(([key, value]) => {
        if (
          value !== node.content.ports.inputs[key].value &&
          !node.content.ports.inputs[key].states?.isBusy
        ) {
          setNodeInput(node.id, key, value);
          const nds = propagatePorts();
          if (nds) {
            useNodesStore.getState().actions.setNodes(nds);
          }
        }
      });
    }, 0);
  }, [props]);
};

export default useLayout;
