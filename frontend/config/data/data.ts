// (import) bibliotheques externes
import React from "react";

// (import) types
import { EdgeType } from "@/frontend/schemas/edge";
import { NodeType } from "@/frontend/schemas/node";

// (import) utils
import { createDefaultNode } from "@/frontend/lib/defaultNodes";

// (import) parts
import BatchNormComponent from "@/frontend/components/nodes/assets/BatchNormNode";
import CompileNodeComponent from "@/frontend/components/nodes/assets/CompileNode";
import DataNodeComponent from "@/frontend/components/nodes/assets/DataNode";
import DenseNodeComponent from "@/frontend/components/nodes/assets/DenseNode";
import FitNodeComponent from "@/frontend/components/nodes/assets/FitNode";
import InputNodeComponent from "@/frontend/components/nodes/assets/InputNode";
import LabelEncodingNodeComponent from "@/frontend/components/nodes/assets/LabelEncodingNode";
import ModelNodeComponent from "@/frontend/components/nodes/assets/ModelNode";
import PredictNodeComponent from "@/frontend/components/nodes/assets/PredictNode";
import ScalingNodeComponent from "@/frontend/components/nodes/assets/ScalingNode";
import VectorNodeComponent from "@/frontend/components/nodes/assets/VectorNode";
/* 
import Conv2DNodeComponent from "@/frontend/components/shared/node/Assets/Layers/Conv2D/Conv2D";
import GraphVisualizationNodeComponents from "@/frontend/components/shared/node/Assets/Utility/Graph/Graph";
import LabelEncodingNodeComponents from "@/frontend/components/shared/node/Assets/Utility/LabelEncoding";
import ScalingNodeComponent from "@/frontend/components/shared/node/Assets/Utility/Scaling";
 */


import nodesData from "./nodesExample.json"

const nodeRegistry: Record<
  string,
  React.MemoExoticComponent<React.ComponentType<any>>
> = {
  compile: React.memo(CompileNodeComponent),
  dense: React.memo(DenseNodeComponent),
  input: React.memo(InputNodeComponent),
  vector: React.memo(VectorNodeComponent),
  model: React.memo(ModelNodeComponent),
  fit: React.memo(FitNodeComponent),
  data: React.memo(DataNodeComponent),
  predict: React.memo(PredictNodeComponent),
  scaling: React.memo(ScalingNodeComponent),
  labelEncoding: React.memo(LabelEncodingNodeComponent),
  batchNorm: React.memo(BatchNormComponent),
  /*   
  conv2d: React.memo(Conv2DNodeComponent),
  compile: React.memo(CompileNodeComponent),
  graph: React.memo(GraphVisualizationNodeComponents), 
  */
};

/* const initialNodes: Record<string, NodeType> = {
  n1: createDefaultNode("input", { x: -1000, y: 0 }, "n1"),
  n2: createDefaultNode("dense", { x: -300, y: 0 }, "n2"),
  n3: createDefaultNode("dense", { x: 300, y: 0 }, "n3"),
  n12: createDefaultNode("dense", { x: 300, y: 0 }, "n12"),
  n5: createDefaultNode("compile", { x: 1600, y: 0 }, "n5"),
  n8: createDefaultNode("vector", { x: 2150, y: 440 }, "n8"),
  n4: createDefaultNode("model", { x: 1000, y: 0 }, "n4"),
  n7: createDefaultNode("fit", { x: 2200, y: 0 }, "n7"),
  n6: createDefaultNode("data", { x: 1000, y: 525 }, "n6"),
  n9: createDefaultNode("predict", { x: 2800, y: 0 }, "n9"),
  n10: createDefaultNode("scaling", { x: 2450, y: 410 }, "n10"),
  n11: createDefaultNode("labelEncoding", { x: 3100, y: 0 }, "n11"),
  n13: createDefaultNode("scaling", { x: 2450, y: 410 }, "n13"),
  n14: createDefaultNode("labelEncoding", { x: 3100, y: 0 }, "n14"),

}; */

const initialNodes: Record<string, NodeType> = nodesData

const initialEdges: Record<string, EdgeType> = {
  e2: {
    id: "e2",
    selected: false,
    sourceNode: "n2",
    sourceHandle: "h1",
    targetNode: "n3",
    targetHandle: "h2",
  },
  e1: {
    id: "e1",
    selected: false,
    sourceNode: "n1",
    sourceHandle: "h1",
    targetNode: "n2",
    targetHandle: "h2",
  },
  e8: {
    id: "e8",
    selected: false,
    sourceNode: "n3",
    sourceHandle: "h1",
    targetNode: "n12",
    targetHandle: "h2",
  },
  e3: {
    id: "e3",
    selected: false,
    sourceNode: "n12",
    sourceHandle: "h1",
    targetNode: "n4",
    targetHandle: "h2",
  },
  e4: {
    id: "e4",
    selected: false,
    sourceNode: "n4",
    sourceHandle: "h1",
    targetNode: "n5",
    targetHandle: "h2",
  },
  e5: {
    id: "e5",
    selected: false,
    sourceNode: "n5",
    sourceHandle: "h1",
    targetNode: "n7",
    targetHandle: "h1",
  },
};

const typeColors: Record<string, string> = {
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

export { initialEdges, initialNodes, nodeRegistry, typeColors };
