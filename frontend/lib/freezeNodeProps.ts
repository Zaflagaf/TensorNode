import React from "react";
import { NodeType } from "../schemas/node";

/**
 * Memoize a Node component based on critical fields (id, selected, position by default)
 * @param Component React component receiving { node: NodeType, ...otherProps }
 * @param fields Array of node fields to watch for rerender (default: ["id", "selected", "position"])
 */
export function freezeNode<P extends { node: NodeType }>(
  Component: React.ComponentType<P>,
  fields: (keyof NodeType)[] = ["id", "selected", "position"]
) {
  return React.memo(Component, (prevProps, nextProps) => {
    return fields.every((field) => {
      const prevVal = prevProps.node[field];
      const nextVal = nextProps.node[field];

      // pour les objets comme position, faire une comparaison shallow
      if (typeof prevVal === "object" && prevVal !== null) {
        return JSON.stringify(prevVal) === JSON.stringify(nextVal);
      }

      return prevVal === nextVal;
    });
  });
}