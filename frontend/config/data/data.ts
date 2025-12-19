import React from "react";

import ActivationNodeComponent from "@/frontend/components/node/assets/ActivationNode";
import BatchNormalizationComponent from "@/frontend/components/node/assets/BatchNormalizationNode";
import ConcatenateNodeComponent from "@/frontend/components/node/assets/ConcatenateNode";
import Conv2DNodeComponent from "@/frontend/components/node/assets/Conv2DNode";
import Conv2DTransposeNodeComponent from "@/frontend/components/node/assets/Conv2DTranspose";
import DenseNodeComponent from "@/frontend/components/node/assets/DenseNode";
import DropoutNodeComponent from "@/frontend/components/node/assets/DropoutNode";
import FillNodeComponent from "@/frontend/components/node/assets/FillNode";
import FlattenNodeComponent from "@/frontend/components/node/assets/FlattenNode";
import ImagesNodeComponents from "@/frontend/components/node/assets/ImagesNode";
import InputNodeComponent from "@/frontend/components/node/assets/InputNode";
import LabelEncodingNodeComponent from "@/frontend/components/node/assets/LabelEncodingNode";
import LatentVectoreNodeComponent from "@/frontend/components/node/assets/LatentVectorNode";
import LossFunctionNodeComponent from "@/frontend/components/node/assets/LossFunctionNode";
import MathNodeComponent from "@/frontend/components/node/assets/MathNode";
import ModelNodeComponent from "@/frontend/components/node/assets/ModelNode";
import OutputNodeComponent from "@/frontend/components/node/assets/OutputNode";
import ReshapeNodeComponent from "@/frontend/components/node/assets/ReshapeNode";
import ScalingNodeComponent from "@/frontend/components/node/assets/ScalingNode";
import ScoreNodeComponent from "@/frontend/components/node/assets/ScoreNode";
import TableNodeComponent from "@/frontend/components/node/assets/TableNode";
import TensorNodeComponent from "@/frontend/components/node/assets/TensorNode";
import ViewerNodeComponent from "@/frontend/components/node/assets/ViewerNode";
import ValueNodeComponent from "@/frontend/components/node/assets/ValueNode";

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
  table: React.memo(TableNodeComponent, areEqual),
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
  viewer: React.memo(ViewerNodeComponent, areEqual),
  value: React.memo(ValueNodeComponent, areEqual)
};

export const typeColors: Record<string, string> = {
  data: "var(--color-hue-200)",

  string: "var(--color-hue-40",
  default: "var(--color-muted-foreground)",
  tensor: "var(--color-hue-200)",
  layer: "var(--color-neutral-500)",
};
