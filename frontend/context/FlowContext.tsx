"use client";
import { Edge, Node } from "@/frontend/components/other/FlowType";
import { nanoid } from "nanoid";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { defaultNode } from "../lib/defaultNodes";

// Types des composants de nœud
const nodesType: Record<
  string,
  React.MemoExoticComponent<React.ComponentType<any>>
> = {
  /*   dense: React.memo(DenseNodeComponent),
  conv2d: React.memo(Conv2DNodeComponent),
  model: React.memo(ModelNodeComponent),
  compile: React.memo(CompileNodeComponent),
  data: React.memo(DataNodeComponent),
  input: React.memo(InputNodeComponent),
  fit: React.memo(FitNodeComponent),
  vector: React.memo(VectorNodeComponent),
  predict: React.memo(PredictNodeComponent),
  scaling: React.memo(ScalingNodeComponent),
  labelEncoding: React.memo(LabelEncodingNodeComponents),
  graph: React.memo(GraphVisualizationNodeComponents), */
};

const initialNodes: Node[] = [
  /*   defaultNode("input", { x: -1000, y: 0 }, "n1"),
  defaultNode("dense", { x: -300, y: 0 }, "n2"),
  defaultNode("dense", { x: 300, y: 0 }, "n3"),
  defaultNode("model", { x: 1000, y: 0 }, "n4"),
  defaultNode("compile", { x: 1600, y: 0 }, "n5"),
  defaultNode("data", { x: 1000, y: 525 }, "n6"),
  defaultNode("fit", { x: 2200, y: 0 }, "n7"),
  defaultNode("vector", { x: 2150, y: 440 }, "n8"),
  defaultNode("predict", { x: 2800, y: 0 }, "n9"),
  defaultNode("scaling", { x: 2450, y: 410 }, "n10"),
  defaultNode("labelEncoding", { x: 3100, y: 0 }, "n11"), */
];

const initialEdges: Edge[] = [];

const TYPE_COLORS: Record<string, string> = {
  model: "#FF595E", // rouge clair
  layer: "#FFCA3A", // jaune doré
  "1": "#8AC926", // vert vif

  features: "#1982C4", // bleu moyen
  data: "#1982C4", // bleu moyen

  "2": "#6A4C93", // violet doux

  "3": "#FF7F11", // orange vif
  labels: "#17C3B2", // turquoise
  "4": "#D72631", // rose vif
  "5": "#14213D", // bleu nuit
  "6": "#6B8E23", // vert olive
  default: "#6b7280", // gris neutre
};

// Déclaration du contexte
const FlowContext = createContext<FlowContextType | null>(null);

export const useFlowContext = (): FlowContextType => {
  const context = useContext(FlowContext);
  if (!context)
    throw new Error("useFlowContext must be used within a FlowProvider");
  return context;
};

// Type du contexte
interface FlowContextType {
  TYPE_COLORS: Record<string, string>;
  nodes: Record<string, Node>;
  setNodes: React.Dispatch<React.SetStateAction<Record<string, Node>>>;
  edges: Record<string, Edge>;
  setEdges: React.Dispatch<React.SetStateAction<Record<string, Edge>>>;
  activeNode: string;
  setActiveNode: React.Dispatch<React.SetStateAction<string>>;
  activeEdge: string;
  setActiveEdge: React.Dispatch<React.SetStateAction<string>>;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  dragEdge: HTMLDivElement | null;
  setDragEdge: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
  setNodePosition: (id: string, position: { x: number; y: number }) => void;
  nodesType: Record<string, React.MemoExoticComponent<any>>;
  nodeToFront: (id: string) => void;
  updateNode: (nodeId: string, path: string, newValue: any) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  addEdge: (
    targetId: string,
    sourceId: string,
    sourceHandleId: string,
    targetHandleId: string,
    id: string,
    sourceHandleType: string,
    targetHandleType: string
  ) => void;
  canvasRef: React.RefObject<HTMLElement | null>;
  editorRef: React.RefObject<HTMLElement | null>;
}

const FlowProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [activeNode, setActiveNode] = useState<string>("");
  const [activeEdge, setActiveEdge] = useState<string>("");
  const [dragEdge, setDragEdge] = useState<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLElement | null>(null);
  const editorRef = useRef<HTMLElement | null>(null);

/*   useEffect(() => {
    canvasRef.current = document.getElementById("canvas");
    editorRef.current = document.getElementById("editor");
    fetchDataDirect("edges", edges);
    fetchDataDirect("nodes", nodes);
  }, []); */

  const addEdge = (
    targetId: string,
    sourceId: string,
    sourceHandleId: string,
    targetHandleId: string,
    id: string,
    sourceHandleType: string = "source",
    targetHandleType: string = "target"
  ) => {
    setEdges((eds: any) => {
      const newId = id;
      let from = "";
      let to = "";

      if (sourceHandleType == "source" && targetHandleType == "target") {
        from = sourceHandleId;
        to = targetHandleId;
      } else if (sourceHandleType == "target" && targetHandleType == "source") {
        from = targetHandleId;
        to = sourceHandleId;
      } else if (
        (sourceHandleType == "source" && targetHandleType == "source") ||
        (sourceHandleType == "target" && targetHandleType == "target")
      ) {
        return eds;
      }

      const feds = {
        ...eds,
        [`e${newId}`]: {
          id: `e${newId}`,
          source: sourceId,
          target: targetId,
          sourceHandle: sourceHandleId,
          targetHandle: targetHandleId,
        },
      };

      return feds;
    });
  };

  const addNode = (type: string, position: { x: number; y: number }) => {
    const id = nanoid();
    setNodes((prev: Record<string, Node>) => {
      const nds = {
        ...prev,
        [id]: defaultNode(type, position, id),
      };

      return nds;
    });
    setActiveNode(id);
  };

  let currentAbortController: AbortController | null = null;

/*   const fetchDataDirect = (
    type: "nodes" | "edges",
    data: Record<string, any>
  ) => {
    if (currentAbortController) {
      currentAbortController.abort();
    }

    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    const url = `http://localhost:3001/api/save-${type}`;
    const dataToSend = JSON.parse(JSON.stringify(data));
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] 📤 Envoi des ${type} au serveur :`, dataToSend);

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
      signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.text())))
      .then((resData) =>
        console.log(`[${timestamp}] ✅ Réponse du serveur ${type} :`, resData)
      )
      .catch((error) => {
        if (error.name === "AbortError") {
          console.warn(`[${timestamp}] ⚠️ Requête ${type} annulée`);
        } else {
          console.error(
            `[${timestamp}] ❌ Erreur lors de l'envoi des ${type} :`,
            error
          );
        }
      });
  }; */

  const updateNode = (nodeId: string, path: string, newValue: any) => {
    const timeout = setTimeout(() => {
      setNodes((prevNodes) => {
        const node = prevNodes[nodeId];
        if (!node) return prevNodes;

        const updatedNode = JSON.parse(JSON.stringify(node)); // deep clone safe

        const keys = path.split(".");
        let target = updatedNode.data;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in target)) {
            target[keys[i]] = {};
          }
          target = target[keys[i]];
        }

        target[keys[keys.length - 1]] = newValue;
        return {
          ...prevNodes,
          [nodeId]: updatedNode,
        };
      });
    }, 0);
  };

/*   useEffect(() => setNodes(propagateValues(nodes, edges)), [nodes, edges]);
  useEffect(() => fetchDataDirect("nodes", nodes), [nodes]);
  useEffect(() => fetchDataDirect("edges", edges), [edges]); */

  const propagateValues = (
    nodes: Record<string, Node>,
    edges: Record<string, Edge>
  ): Record<string, Node> => {
    let hasChanged = false;
    const updatedNodes = { ...nodes };

    Object.values(edges).forEach((edge) => {
      const sourceNode = updatedNodes[edge.source];
      const targetNode = updatedNodes[edge.target];

      if (!sourceNode || !targetNode) return;

      const sourceElement = document.getElementById(sourceNode.id);
      const targetElement = document.getElementById(targetNode.id);

      const sourceHandle = sourceElement?.querySelector(
        `#${edge.sourceHandle}`
      );
      const targetHandle = targetElement?.querySelector(
        `#${edge.targetHandle}`
      );

      const sourceKey = sourceHandle?.getAttribute("data-id");
      const targetKey = targetHandle?.getAttribute("data-id");

      if (
        sourceKey &&
        targetKey &&
        sourceNode.data.values.output &&
        targetNode.data.values.input
      ) {
        const newValue = sourceNode.data.values.output[sourceKey];
        const currentValue = targetNode.data.values.input[targetKey];

        if (newValue !== currentValue) {
          // Clonage profond partiel pour immutabilité
          const newInput = {
            ...targetNode.data.values.input,
            [targetKey]: newValue,
          };
          const newValues = { ...targetNode.data.values, input: newInput };
          const newData = { ...targetNode.data, values: newValues };
          const newTargetNode = { ...targetNode, data: newData };

          updatedNodes[edge.target] = newTargetNode;
          hasChanged = true;
        }
      }
    });

    return hasChanged ? updatedNodes : nodes;
  };

  const removeNode = (id: string) => {
    setNodes((prev: Record<string, Node>) => {
      const nds = Object.fromEntries(
        Object.entries(prev).filter(([key, node]) => node.id !== id)
      ) as Record<string, Node>; // 👈 cast ici
      return nds;
    });

    setEdges((prev: Record<string, Edge>) => {
      const eds = Object.fromEntries(
        Object.entries(prev).filter(
          ([_, edge]) => edge.source !== id && edge.target !== id
        )
      ) as Record<string, Edge>;

      return eds;
    });
  };

  const removeEdge = (id: string) => {
    setEdges((prev: Record<string, Edge>) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const values: FlowContextType = {
    TYPE_COLORS,
    nodes,
    setNodes,
    edges,
    setEdges,
    activeNode,
    setActiveNode,
    activeEdge,
    setActiveEdge,
    removeNode,
    removeEdge,
    dragEdge,
    setDragEdge,
    setNodePosition: (id: string, pos: { x: number; y: number }) =>
      setNodes((nds: Record<string, Node>) =>
        Object.fromEntries(
          Object.entries(nds).map(([key, node]) => [
            key,
            node.id === id ? { ...node, position: pos } : node,
          ])
        )
      ),
    nodeToFront: (id: string) => {
      /* Implémenter la logique pour mettre un node devant */
    },
    updateNode,
    addNode,
    addEdge,
    canvasRef,
    editorRef,
    nodesType,
  };

  return (
    <ZoomProvider>
      <FlowContext.Provider value={values}>{children}</FlowContext.Provider>
    </ZoomProvider>
  );
};

export default FlowProvider;
