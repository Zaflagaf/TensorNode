import {
  DefaultNode,
  FirstOrderCategory,
  Node,
  NodeConfigs,
  NodeType,
  PortsCluster,
  Position,
} from "@/frontend/types";
import * as Icons from "lucide-react";
import { ComponentType } from "react";

export const NODE_CONFIGS: NodeConfigs = {
  Input: {
    icon: "ArrowRightToLine",
    color: "bg-hue-0",
    items: [
      {
        name: "Input",
        description: "Input layer of the model.",
        type: "input",
        icon: "ArrowRightToLine",
        ports: {
          inputs: { "in-shape": { value: [4] } },
          outputs: { "out-layer": { type: "layer" } },
        },
      },
    ],
  },
  Output: {
    icon: "ArrowRightFromLine",
    color: "bg-hue-0",
    items: [
      {
        name: "Output",
        description: "Ouptput layer of the model.",
        type: "output",
        icon: "ArrowRightFromLine",
        ports: {
          inputs: {
            "in-layer": { type: "layer" },
            "in-buildId": { value: "0" },
          },
          outputs: {},
        },
      },
    ],
  },
  Layer: {
    icon: "Layers",
    color: "bg-hue-0",
    items: [
      {
        name: "Activation",
        description: "Applies an activation function to the input layer.",
        type: "activation",
        ports: {
          inputs: {
            "in-layer": { type: "layer" },
            "in-activation": { value: "relu" },
            "in-alpha": { value: 0.1 },
          },
          outputs: { "out-layer": { type: "layer" } },
        },
      },
      {
        name: "Dense",
        description:
          "A fully connected layer with specified units and activation.",
        type: "dense",
        icon: "Sigma",
        ports: {
          inputs: {
            "in-layer": { type: "layer" },
            "in-units": { value: 10 },
            "in-activation": { value: "linear" },
            "in-useBias": { value: true },
          },
          outputs: { "out-layer": { type: "layer" } },
        },
      },
      {
        name: "Conv2D",
        description: "2D convolutional layer for spatial feature extraction.",
        type: "conv2d",
        ports: {
          inputs: {
            "in-layer": { type: "layer" },
            "in-filters": { value: 10 },
            "in-kernelSize": { value: [3, 3] },
            "in-strides": { value: [3, 3] },
            "in-padding": { value: "same" },
            "in-activation": { value: "linear" },
          },
          outputs: { "out-layer": { type: "layer" } },
        },
      },
      {
        name: "Conv2D Transpose",
        description: "Transposed convolution layer for upsampling.",
        type: "conv2dTranspose",
        ports: {
          inputs: {
            "in-layer": { type: "layer" },
            "in-filters": { value: 10 },
            "in-kernelSize": { value: [3, 3] },
            "in-strides": { value: [2, 2] },
            "in-padding": { value: "same" },
            "in-outputPadding": { value: [0, 0] },
            "in-activation": { value: "linear" },
            "in-useBias": { value: true },
          },
          outputs: { "out-layer": { type: "layer" } },
        },
      },
      {
        name: "Flatten",
        description: "Flattens the input layer into a 1D vector.",
        type: "flatten",
        icon: "Minus",
        ports: {
          inputs: { "in-layer": { type: "layer" } },
          outputs: { "out-layer": { type: "layer" } },
        },
      },
      {
        name: "Reshape",
        description: "Reshapes the input layer to a specified shape.",
        type: "reshape",
        ports: {
          inputs: { "in-layer": { type: "layer" }, "in-shape": { value: [4] } },
          outputs: { "out-layer": { type: "layer" } },
        },
      },
      {
        name: "Dropout",
        description:
          "Randomly drops a fraction of input units to prevent overfitting.",
        type: "dropout",
        icon: "Droplet",
        ports: {
          inputs: { "in-layer": { type: "layer" }, "in-rate": { value: 0.2 } },
          outputs: { "out-layer": { type: "layer" } },
        },
      },
      {
        name: "Batch Normalization",
        description: "Normalizes inputs to improve training stability.",
        type: "batchNormalization",
        ports: {
          inputs: {
            "in-layer": { type: "layer" },
            "in-momentum": { value: 0.2 },
          },
          outputs: { "out-layer": { type: "layer" } },
        },
      },
    ],
  },
  Compose: {
    icon: "BrainIcon",
    color: "bg-hue-0",
    items: [
      {
        name: "Model",
        description: "Encapsulates a sub-model with data input and output.",
        type: "model",
        ports: {
          inputs: {
            "in-data": { type: "tensor" },
            "in-layerId": {},
            "in-modelId": {},
            "in-buildId": { value: "0" },
          },
          outputs: { "out-data": { type: "tensor" } },
        },
      },
      {
        name: "Score",
        description: "Calculates a score or metric from input tensors.",
        type: "score",
        icon: "StarIcon",
        ports: {
          inputs: {
            "in-score": { type: "tensor" },
            "in-isTracking": { type: "boolean", value: false },
            "in-trackingName": { type: "string", value: "Score" },
            "in-layerId": {},
            "in-modelId": {},
          },
          outputs: {},
        },
      },
      {
        name: "Concatenate",
        description:
          "Concatenates multiple tensor inputs into one output tensor.",
        type: "concatenate",
        ports: {
          inputs: { "in-a": { type: "tensor" }, "in-b": { type: "tensor" } },
          outputs: { "out-data": { type: "tensor" } },
        },
      },
    ],
  },
  Data: {
    icon: "DatabaseIcon",
    color: "bg-hue-0",
    items: [
      {
        name: "Table",
        description: "Represents tabular input data with features and labels.",
        type: "table",
        ports: {
          inputs: { "in-fileName": {} },
          outputs: {
            "out-features": { value: [], type: "tensor" },
            "out-labels": { value: [], type: "string" },
          },
        },
      },
    ],
  },
  Processing: {
    icon: "Wrench",
    color: "bg-hue-0",
    items: [
      {
        name: "Scaling",
        description: "Scales input data using a specified method.",
        type: "scaling",
        ports: {
          inputs: {
            "in-method": { value: "none" },
            "in-data": { value: [], type: "tensor" },
            "in-reference": { type: "tensor" },
          },
          outputs: {
            "out-data": { value: [], type: "tensor" },
            "out-variables": { type: "tensor" },
          },
        },
      },
      {
        name: "Label Encoding",
        description: "Encodes string labels as numeric values.",
        type: "labelEncoding",
        ports: {
          inputs: {
            "in-labels": { value: [], type: "string" },
            "in-reference": { value: [], type: "string" },
            "in-method": { value: "none" },
          },
          outputs: { "out-data": { value: [], type: "tensor" } },
        },
      },
    ],
  },
  Math: {
    icon: "SquareFunction",
    color: "bg-hue-0",
    items: [
      {
        name: "Loss Function",
        description: "Computes the loss between predicted and true values.",
        type: "lossFunction",
        ports: {
          inputs: {
            "in-loss": { value: "mean_squared_error" },
            "in-prediction": { type: "tensor" },
            "in-labels": { type: "tensor" },
          },
          outputs: { "out-loss": { type: "tensor" } },
        },
      },
      {
        name: "Math",
        description: "Performs a mathematical operation on input tensors.",
        type: "math",
        icon: "SquareFunction",
        ports: {
          inputs: {
            "in-method": { value: "Add" },
            "in-a": { value: 0, type: "tensor" },
            "in-b": { value: 0, type: "tensor" },
          },
          outputs: { "out-value": { type: "tensor" } },
        },
      },
    ],
  },
  Experimental: {
    icon: "Trash",
    color: "bg-hue-0",
    items: [
      {
        name: "Test",
        description: "An empty node to test performance",
        type: "test",
        ports: {
          inputs: { "in-test": {} },
          outputs: { "out-test": {} },
        },
      },
      {
        name: "Images",
        description: "Handles image data input and output.",
        type: "images",
        ports: {
          inputs: { "in-images": { value: [], port: "images" } },
          outputs: {
            "out-images": { value: [], port: "images", type: "tensor" },
          },
        },
      },
      {
        name: "Tensor",
        description: "Represents a generic tensor node.",
        type: "tensor",
        ports: {
          inputs: { "in-data": { value: [[1, 2, 3]] } },
          outputs: { "out-data": { value: [[1, 2, 3]] } },
        },
      },
      {
        name: "Latent Vector",
        description: "Generates a latent vector from a given distribution.",
        type: "latentVector",
        ports: {
          inputs: {
            "in-vectorSize": { value: 100 },
            "in-distribution": { value: "uniform" },
          },
          outputs: { "out-vector": { type: "tensor" } },
        },
      },
      {
        name: "Fill",
        description: "Fills a tensor with a specified number.",
        type: "fill",
        ports: {
          inputs: {
            "in-data": { type: "tensor" },
            "in-fillNumber": { value: 1 },
          },
          outputs: { "out-data": { type: "tensor" } },
        },
      },
      {
        name: "Viewer",
        description: "Displays the input tensor using a chosen method.",
        type: "viewer",
        icon: "Eye",
        ports: {
          inputs: {
            "in-data": { type: "tensor" },
            "in-method": { value: "raw" },
          },
          outputs: {
            "out-data": {},
          },
        },
      },
    ],
  },
} as NodeConfigs;

export type ContextMenuNode = {
  name: string;
  type: NodeType;
  icon?: ComponentType<Icons.LucideProps> | null;
  color?: string | null;
  description?: string | null;
};

export type ContextMenuCategory = {
  icon: ComponentType<Icons.LucideProps> | null;
  color?: string | null;
  items: ContextMenuNode[];
};
export type ContextMenu = Record<FirstOrderCategory, ContextMenuCategory>;
export function createContextMenu(
  configs: NodeConfigs = NODE_CONFIGS
): ContextMenu {
  const result = {} as ContextMenu;

  for (const key in configs) {
    const category = configs[key as FirstOrderCategory];

    result[key as FirstOrderCategory] = {
      icon: Icons[category.icon] ?? null,
      color: category.color ?? null,
      items: category.items.map((item) => ({
        name: item.name,
        type: item.type,
        icon: item.icon ? Icons[item.icon] ?? null : null,
        color: category.color ?? null,
        description: item.description ?? null,
      })),
    };
  }

  return result;
}

export function createDefaultNode(
  type: NodeType,
  position: Position,
  id: string
): Node {
  // 1. Trouver le node dans n'importe quelle catégorie
  const category = Object.values(NODE_CONFIGS).find((cat) =>
    cat.items.some((node) => node.type === type)
  );

  if (!category) {
    throw new Error(`NodeType "${type}" not found in NODE_CONFIGS`);
  }

  // 2. Trouver l'entrée exacte
  const baseNode = category.items.find((node) => node.type === type)!;

  // 3. Clone profond typé
  const config: DefaultNode = structuredClone(baseNode);

  // 4. Ajouter les states de ports
  if (config.ports) {
    ["inputs", "outputs"].forEach((portType) => {
      const portGroup = config.ports[portType as PortsCluster];
      if (portGroup) {
        Object.keys(portGroup).forEach((handleId) => {
          if (!portGroup[handleId].states) {
            portGroup[handleId].states = { isBusy: false };
          }
        });
      }
    });
  }

  return {
    id,
    box: {
      position,
      width: 0,
      height: 0,
    },
    type,
    content: {
      ...config,
      icon: config.icon,
      color: category.color ?? null,
    },
  };
}
