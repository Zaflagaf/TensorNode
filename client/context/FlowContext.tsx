"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { Node, Edge } from "@/components/other/FlowType";
import useNodesState from "./useNodesState";
import useEdgesState from "./useEdgesState";
import { ZoomProvider } from "./ZoomContext";
import { defaultNode } from "./defaultNodes";
import { nanoid } from "nanoid";

// Types de composants de nœud
import Node1 from "@/components/node/Assets/node1/Node1";
import DenseNodeComponent from "@/components/node/Assets/Dense/Dense";
import Conv2DNodeComponent from "@/components/node/Assets/Conv2D/Conv2D";
import ModelNodeComponent from "@/components/node/Assets/Model/Model";
import CompileNodeComponent from "@/components/node/Assets/Compile/Compile";
import DataNodeComponent from "@/components/node/Assets/Data/Data";
import InputNodeComponent from "@/components/node/Assets/Input/Input";
import FitNodeComponent from "@/components/node/Assets/Fit/Fit";

// Déclaration du contexte
const FlowContext = createContext<FlowContextType | null>(null);

export const useFlowContext = (): FlowContextType => {
  const context = useContext(FlowContext);
  if (!context)
    throw new Error("useFlowContext must be used within a FlowProvider");
  return context;
};

// Types des composants de nœud
const nodesType: {
  [key: string]: React.MemoExoticComponent<React.ComponentType<any>>;
} = {
  node1: React.memo(Node1),
  dense: React.memo(DenseNodeComponent),
  conv2d: React.memo(Conv2DNodeComponent),
  model: React.memo(ModelNodeComponent),
  compile: React.memo(CompileNodeComponent),
  data: React.memo(DataNodeComponent),
  input: React.memo(InputNodeComponent),
  fit: React.memo(FitNodeComponent),
};

const initialNodes: Node[] = [
  defaultNode("input", { x: -1000, y: 0 }, "n1"),
  defaultNode("dense", { x: -300, y: 0 }, "n2"),
  defaultNode("dense", { x: 300, y: 0 }, "n3"),
  defaultNode("model", { x: 1000, y: 0 }, "n4"),
  defaultNode("compile", { x: 1600, y: 0 }, "n5"),
  defaultNode("data", { x: 1600, y: 600 }, "n6"),
  defaultNode("fit", { x: 2200, y: 0 }, "n7"),
];

const initialEdges: Edge[] = [
  {
    id: "e1",
    source: "n1",
    target: "n2",
    sourceHandle: "h1",
    targetHandle: "h2",
  },
  {
    id: "e2",
    source: "n2",
    target: "n3",
    sourceHandle: "h1",
    targetHandle: "h2",
  },
  {
    id: "e4",
    source: "n3",
    target: "n4",
    sourceHandle: "h1",
    targetHandle: "h2",
  },
  {
    id: "e5",
    source: "n4",
    target: "n5",
    sourceHandle: "h1",
    targetHandle: "h2",
  },
  {
    id: "e6",
    source: "n5",
    target: "n7",
    sourceHandle: "h1",
    targetHandle: "h1",
  },
  {
    id: "e7",
    source: "n6",
    target: "n7",
    sourceHandle: "h1",
    targetHandle: "h2",
  },
  {
    id: "e8",
    source: "n6",
    target: "n7",
    sourceHandle: "h2",
    targetHandle: "h3",
  },
];

// Type du contexte
interface FlowContextType {
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

  setNodeValues: (id: string, values: { [key: string]: any }) => void;
  setNodePosition: (id: string, position: { x: number; y: number }) => void;

  nodesType: { [key: string]: React.MemoExoticComponent<any> };
  nodeToFront: (id: string) => void;
  nodeInfo: any;
  updateNode: (nodeId: string, path: string, newValue: any) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;

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

  useEffect(() => {
    canvasRef.current = document.getElementById("canvas");
    editorRef.current = document.getElementById("editor");
    fetchDataDirect("edges", edges);
    fetchDataDirect("nodes", nodes);
  }, []);

  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const id = nanoid();
      setNodes((prev: Record<string, Node>) => {
        const nds = {
          ...prev,
          [id]: defaultNode(type, position, id),
        };
        fetchDataDirect("nodes", nds);

        return nds;
      });
      setActiveNode(id);
    },
    []
  );

  const updateNode = useCallback(
    (nodeId: string, path: string, newValue: any) => {
      setNodes((prevNodes: Record<string, Node>) => {
        const updatedNodes = Object.keys(prevNodes).reduce(
          (updated: Record<string, Node>, nodeKey) => {
            const node = prevNodes[nodeKey];
            if (node.id !== nodeId) {
              updated[nodeKey] = node;
              return updated;
            }
            const newNode = { ...node, data: { ...node.data } };
            let target: any = newNode.data;
            const keys = path.split(".");
            for (let i = 0; i < keys.length - 1; i++) {
              target[keys[i]] = { ...target[keys[i]] };
              target = target[keys[i]];
            }
            target[keys[keys.length - 1]] = newValue;
            updated[nodeKey] = newNode;
            return updated;
          },
          {} as Record<string, Node>
        );

        fetchDataDirect("nodes", updatedNodes);
        return updatedNodes;
      });
    },
    [nodes, setNodes]
  );

  const fetchDataDirect = (
    type: "nodes" | "edges",
    data: Record<string, any>
  ) => {
    const url = `http://localhost:3001/api/save-${type}`;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.text())))
      .then((data) => console.log(`Réponse du serveur pour ${type} :`, data))
      .catch((error) =>
        console.error(`Erreur côté client lors de l'envoi des ${type} :`, error)
      );
  };

  ///////////////////////

  function extractNodeValues(nodes: Record<string, Node>) {
    return Object.fromEntries(
      Object.entries(nodes).map(([id, node]) => [id, node.data.values])
    );
  }

  const nodeValuesHash = JSON.stringify(extractNodeValues(nodes));

  useEffect(() => {
    const updatedNodes = propagateValues(nodes, edges);
    setNodes(updatedNodes);
  }, [nodeValuesHash, edges]);

  function propagateValues(
    nodes: Record<string, Node>,
    edges: Record<string, Edge>
  ): Record<string, Node> {
    const updatedNodes = { ...nodes };
    let hasChanged = false;

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
          targetNode.data.values.input[targetKey] = newValue;
          hasChanged = true;
        }
      }
    });

    return hasChanged ? updatedNodes : nodes;
  }

  const removeNode = useCallback((id: string) => {
    setNodes((prev: Record<string, Node>) =>
      Object.fromEntries(
        Object.entries(prev).filter(([key, node]) => node.id !== id)
      )
    );
    setEdges((prev: Record<string, Edge>) =>
      Object.fromEntries(
        Object.entries(prev).filter(
          ([key, edge]) => edge.source !== id && edge.target !== id
        )
      )
    );
  }, []);

  const values: FlowContextType = {
    nodes,
    setNodes,
    edges,
    setEdges,
    activeNode,
    setActiveNode,
    activeEdge,
    setActiveEdge,
    removeNode,
    removeEdge: removeNode,
    dragEdge,
    setDragEdge,
    setNodeValues: (id: string, values: { [key: string]: any }) =>
      setNodes((nds: Record<string, Node>) => {
        if (!nds[id]) return nds;
        return {
          ...nds,
          [id]: {
            ...nds[id],
            data: {
              ...nds[id].data,
              values: {
                ...nds[id].data?.values,
                ...values,
              },
            },
          },
        };
      }),
    setNodePosition: (id: string, pos: { x: number; y: number }) =>
      setNodes((nds: Record<string, Node>) =>
        Object.fromEntries(
          Object.entries(nds).map(([key, node]) => [
            key,
            node.id === id ? { ...node, position: pos } : node,
          ])
        )
      ),
    nodeInfo: (id: string) => nodes[id],
    nodeToFront: (id: string) => {
      /* Implémenter la logique pour mettre un node devant */
    },
    updateNode,
    addNode,
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
