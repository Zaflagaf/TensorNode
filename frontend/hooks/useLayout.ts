"use client";
import propagatePorts from "@/frontend/lib/node&edge-logic/propagatePorts";
import { useEdgesStore } from "@/frontend/store/edgesStore";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { Node } from "@/frontend/types";
import { produce } from "immer";
import { useEffect } from "react";

const useLayout = (node: Node, props: Record<string, any>) => {
  const setNodes = useNodesStore((state) => state.actions.setNodes);

  useEffect(() => {
    const nodes = useNodesStore.getState().nodes;
    const edges = useEdgesStore.getState().edges;

    const updatedNodes = produce(nodes, (draft) => {
      const draftNode = draft[node.id];
      if (!draftNode) return;

      const { inputs, outputs } = draftNode.content.ports;

      Object.entries(props).forEach(([key, value]) => {
        // auto-detect where the port belongs
        const port =
          inputs[key] !== undefined
            ? inputs[key]
            : outputs[key] !== undefined
            ? outputs[key]
            : null;

        if (!port) return;

        // Only update if not busy and value has changed
        if (value !== port.value && !port.states?.isBusy) {
          port.value = value;
        }
      });
    });

    const nds = propagatePorts(updatedNodes, edges);

    setNodes(nds);
  }, [props, node.id, setNodes]);
};

export default useLayout;
