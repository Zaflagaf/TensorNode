import { useEffect, useRef, useCallback } from "react";
import { NodeType } from "../schemas/node";
import { useNodesStore } from "../store/nodesStore";

/**
 * Hook personnalisé pour observer une partie d'un node
 * @param node Le node complet
 * @param selector Fonction qui retourne la valeur à observer (ex: node => node.content.ports.inputs.model)
 * @param callback Fonction appelée quand la valeur observée change
 */
export function useNodeWatch<T>(
  node: any,
  selector: (node: any) => T,
  callback: (value: T) => void
) {
  const prevValueRef = useRef<T | undefined>(undefined);

  useEffect(() => {
    const currentValue = selector(node);

    if (prevValueRef.current !== currentValue) {
      prevValueRef.current = currentValue;
      callback(currentValue);
    }
  }, [node, selector, callback]);
}


/**
 * Lie un port input d’un node à un port output du même node.
 * Chaque fois que l’input change → l’output est mis à jour.
 */
export function useGlue(
  node: NodeType,
  inputKey: string,
  outputKey: string
) {

  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput)
  const selector = useCallback(
    (n: NodeType) => n.content.ports.inputs[inputKey],
    [inputKey]
  );

  const callback = useCallback(
    
    (newValue: any) => {
      setNodeOutput(node.id, outputKey, newValue);
      console.log(`[useGlue] ${inputKey} → ${outputKey} =`, newValue);
    },
    [node.id, outputKey, node.content.ports.inputs[inputKey], setNodeOutput]
  );

  useNodeWatch(node, selector, callback);
}
