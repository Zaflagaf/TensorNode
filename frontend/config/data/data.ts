import React from "react";

// (import) types
import { Edges, Layers, Nodes } from "@/frontend/types";

// (import) utils
import { createDefaultNode } from "@/frontend/lib/defaultNodes";

// (import) parts
import ActivationNodeComponent from "@/frontend/components/nodes/assets/ActivationNode";
import BatchNormalizationComponent from "@/frontend/components/nodes/assets/BatchNormalizationNode";
import ConcatenateNodeComponent from "@/frontend/components/nodes/assets/ConcatenateNode";
import Conv2DNodeComponent from "@/frontend/components/nodes/assets/Conv2DNode";
import Conv2DTransposeNodeComponent from "@/frontend/components/nodes/assets/Conv2DTranspose";
import DenseNodeComponent from "@/frontend/components/nodes/assets/DenseNode";
import DropoutNodeComponent from "@/frontend/components/nodes/assets/DropoutNode";
import ExcelNodeComponent from "@/frontend/components/nodes/assets/ExcelNode";
import FillNodeComponent from "@/frontend/components/nodes/assets/FillNode";
import FlattenNodeComponent from "@/frontend/components/nodes/assets/FlattenNode";
import ImagesNodeComponents from "@/frontend/components/nodes/assets/ImagesNode";
import InputNodeComponent from "@/frontend/components/nodes/assets/InputNode";
import LabelEncodingNodeComponent from "@/frontend/components/nodes/assets/LabelEncodingNode";
import LatentVectoreNodeComponent from "@/frontend/components/nodes/assets/LatentVectorNode";
import LossFunctionNodeComponent from "@/frontend/components/nodes/assets/LossFunctionNode";
import MathNodeComponent from "@/frontend/components/nodes/assets/MathNode";
import ModelNodeComponent from "@/frontend/components/nodes/assets/ModelNode";
import OutputNodeComponent from "@/frontend/components/nodes/assets/OutputNode";
import ReshapeNodeComponent from "@/frontend/components/nodes/assets/ReshapeNode";
import ScalingNodeComponent from "@/frontend/components/nodes/assets/ScalingNode";
import ScoreNodeComponent from "@/frontend/components/nodes/assets/ScoreNode";
import TensorNodeComponent from "@/frontend/components/nodes/assets/TensorNode";

const areEqual = (prevProps: any, nextProps: any) => {
  const { box: prevBox, ...prevRest } = prevProps.node;
  const { box: nextBox, ...nextRest } = nextProps.node;

  return JSON.stringify(prevRest) === JSON.stringify(nextRest);
};

export const nodeRegistry: Record<
  string,
  React.MemoExoticComponent<React.ComponentType<any>>
> = {
  dense: React.memo(DenseNodeComponent, areEqual),
  input: React.memo(InputNodeComponent, areEqual),
  output: React.memo(OutputNodeComponent, areEqual),
  tensor: React.memo(TensorNodeComponent, areEqual),
  model: React.memo(ModelNodeComponent, areEqual),
  excel: React.memo(ExcelNodeComponent, areEqual),
  scaling: React.memo(ScalingNodeComponent, areEqual),
  labelEncoding: React.memo(LabelEncodingNodeComponent, areEqual),
  reshape: React.memo(ReshapeNodeComponent, areEqual),
  lossFunction: React.memo(LossFunctionNodeComponent, areEqual),
  conv2d: React.memo(Conv2DNodeComponent, areEqual),
  conv2dTranspose: React.memo(Conv2DTransposeNodeComponent, areEqual),
  dropout: React.memo(DropoutNodeComponent, areEqual),
  activation: React.memo(ActivationNodeComponent, areEqual),
  flatten: React.memo(FlattenNodeComponent, areEqual),
  batchNormalization: React.memo(BatchNormalizationComponent, areEqual),
  latentVector: React.memo(LatentVectoreNodeComponent),
  concatenate: React.memo(ConcatenateNodeComponent, areEqual),
  fill: React.memo(FillNodeComponent, areEqual),
  score: React.memo(ScoreNodeComponent, areEqual),
  math: React.memo(MathNodeComponent, areEqual),
  images: React.memo(ImagesNodeComponents, areEqual),
};

export const initialNodes: Nodes = {
  "node-1": createDefaultNode("input", { x: -75, y: 0 }, "node-1"),
  "node-2": createDefaultNode("dense", { x: 300, y: 0 }, "node-2"),
  "node-3": createDefaultNode("dense", { x: 600, y: 0 }, "node-3"),
  "node-4": createDefaultNode("dense", { x: 900, y: 0 }, "node-4"),
  "node-51": createDefaultNode("output", { x: 1200, y: 0 }, "node-51"),

  "node-5": createDefaultNode("model", { x: 700, y: 250 }, "node-5"),
  "node-8": createDefaultNode("excel", { x: 1000, y: 525 }, "node-8"),
  "node-011": createDefaultNode(
    "lossFunction",
    { x: 1300, y: 525 },
    "node-011"
  ),

  "node-9": createDefaultNode("tensor", { x: 2150, y: 440 }, "node-9"),

  "node-11": createDefaultNode("scaling", { x: 2450, y: 410 }, "node-11"),
  "node-12": createDefaultNode("labelEncoding", { x: 3100, y: 0 }, "node-12"),
  "node-13": createDefaultNode("scaling", { x: 2450, y: 410 }, "node-13"),
  "node-14": createDefaultNode("labelEncoding", { x: 3100, y: 0 }, "node-14"),
};

export const initialEdges: Edges = {};

export const typeColors: Record<string, string> = {
  data: "var(--color-hue-200)",

  string: "var(--color-hue-40",
  default: "var(--color-muted-foreground)",
  tensor: "var(--color-hue-200)",
  layer: "var(--color-hue-350)",
};

export const initialLayers: Layers = {
  "c-1": {
    id: "c-1",
    name: "Compositor",
    type: "compositor",
    content: ["node-5", "node-8", "node-011", "node-11", "node-12"],
    transform: { x: 0, y: 0, k: 1 },
  },
  "m-1": {
    id: "m-1",
    name: "MLP",
    model: null,
    type: "model",
    content: ["node-1", "node-2", "node-3", "node-4", "node-51"],
    transform: { x: 0, y: 0, k: 1 },
  },
};
