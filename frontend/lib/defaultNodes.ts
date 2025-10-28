import { Node, NodeContent, NodeType, Position } from "@/frontend/types";

// Record<NodeType, Partial<NodeContent>>
export const NODE_CONFIGS = {
  // Layer Nodes
  images: {
    name: "Images",
    ports: {
      inputs: {
        "in-images": { value: [], port: "images" },
      },
      outputs: {
        "out-images": { value: [], port: "images", type: "tensor" },
      },
    },
  },
  activation: {
    name: "Activation",
    ports: {
      inputs: {
        "in-layer": { type: "layer" },
        "in-activation": { value: "relu" },
        "in-alpha": { value: 0.1 },
      },
      outputs: {
        "out-layer": { type: "layer" },
      },
    },
  },
  dense: {
    name: "Dense",
    ports: {
      inputs: {
        "in-layer": { type: "layer" },
        "in-units": { value: 10 },
        "in-activation": { value: "linear" },
        "in-useBias": { value: true },
      },
      outputs: {
        "out-layer": { type: "layer" },
      },
    },
  },

  conv2d: {
    name: "Conv2D",
    ports: {
      inputs: {
        "in-layer": { type: "layer" },
        "in-filters": { value: 10 },
        "in-kernelSize": { value: [3, 3] },
        "in-strides": { value: [3, 3] },
        "in-padding": { value: "same" },
        "in-activation": { value: "linear" },
      },
      outputs: {
        "out-layer": { type: "layer" },
      },
    },
  },
  conv2dTranspose: {
    name: "Conv2D Transpose",
    ports: {
      inputs: {
        "in-layer": { type: "layer" },
        "in-filters": { value: 10 },
        "in-kernelSize": { value: [3, 3] },
        "in-strides": { value: [2, 2] }, // par défaut on upsample ×2
        "in-padding": { value: "same" },
        "in-outputPadding": { value: [0, 0] }, // optionnel
        "in-activation": { value: "linear" },
        "in-useBias": { value: true },
      },
      outputs: {
        "out-layer": { type: "layer" },
      },
    },
  },
  input: {
    name: "Input",
    ports: {
      inputs: {
        "in-shape": { value: [4] },
      },
      outputs: {
        "out-layer": { type: "layer" },
      },
    },
  },

  batchNormalization: {
    name: "Batch Normalization",
    ports: {
      inputs: {
        "in-layer": { type: "layer" },
        "in-momentum": { value: 0.2 },
      },
      outputs: {
        "out-layer": { type: "layer" },
      },
    },
  },

  output: {
    name: "Output",
    ports: {
      inputs: {
        "in-layer": { type: "layer" },
        "in-shape": { value: [4] },
      },
      outputs: {},
    },
  },
  flatten: {
    name: "Flatten",
    ports: {
      inputs: {
        "in-layer": { type: "layer" },
      },
      outputs: {
        "out-layer": { type: "layer" },
      },
    },
  },
  reshape: {
    name: "Reshape",
    ports: {
      inputs: {
        "in-layer": { type: "layer" },
        "in-shape": { value: [4] },
      },
      outputs: {
        "out-layer": { type: "layer" },
      },
    },
  },

  dropout: {
    name: "Dropout",
    ports: {
      inputs: {
        "in-layer": { type: "layer" },
        "in-rate": { value: 0.2 },
      },
      outputs: {
        "out-layer": { type: "layer" },
      },
    },
  },

  model: {
    name: "Model",
    ports: {
      inputs: {
        "in-data": { type: "tensor" },
        "in-layerId": {},
        "in-modelId": {},
      },
      outputs: {
        "out-data": { type: "tensor" },
      },
    },
  },
  excel: {
    name: "Excel",
    ports: {
      inputs: {
        "in-data": {},
        "in-selectedFeatures": {},
        "in-selectedLabels": {},
        "in-features": {},
        "in-labels": {},
      },
      outputs: {
        "out-features": { type: "tensor" },
        "out-labels": { type: "string" },
      },
    },
  },

  tensor: {
    name: "Tensor",
    ports: {
      inputs: {},
      outputs: {
        "out-data": { value: [1, 2, 3] },
      },
    },
  },
  latentVector: {
    name: "Latent Vector",
    ports: {
      inputs: {
        "in-vectorSize": { value: 100 },
        "in-distribution": { value: "uniform" },
      },
      outputs: {
        "out-vector": { type: "tensor" },
      },
    },
  },

  scaling: {
    name: "Scaling",
    ports: {
      inputs: {
        "in-method": { value: "none" },
        "in-data": { type: "tensor" },
        "in-reference": { type: "tensor" },
      },
      outputs: {
        "out-data": { type: "tensor" },
        "out-variables": { type: "tensor" }, // !!!
      },
    },
  },

  labelEncoding: {
    name: "Label Encoding",
    ports: {
      inputs: {
        "in-labels": { type: "string" },
        "in-reference": { type: "string" },
        "in-method": {},
      },
      outputs: {
        "out-data": { type: "tensor" },
      },
    },
  },

  lossFunction: {
    name: "Loss Function",
    ports: {
      inputs: {
        "in-loss": { value: "mean_squared_error" },
        "in-prediction": {
          type: "tensor",
        },
        "in-labels": { type: "tensor" },
      },
      outputs: {
        "out-loss": { type: "tensor" },
      },
    },
  },

  concatenate: {
    name: "Concatenate",
    ports: {
      inputs: {
        "in-a": { type: "tensor" },
        "in-b": { type: "tensor" },
      },
      outputs: {
        "out-data": { type: "tensor" },
      },
    },
  },

  fill: {
    name: "Fill",
    ports: {
      inputs: {
        "in-data": { type: "tensor" },
        "in-fillNumber": { value: 1 },
      },
      outputs: {
        "out-data": { type: "tensor" },
      },
    },
  },

  score: {
    name: "Score",
    ports: {
      inputs: {
        "in-score": { type: "tensor" },
        "in-layerId": {},
        "in-modelId": {},
      },
      outputs: {},
    },
  },

  math: {
    name: "Math",
    ports: {
      inputs: {
        "in-method": { value: "Add" },
        "in-a": { value: 0, type: "tensor" },
        "in-b": { value: 0, type: "tensor" },
      },
      outputs: {
        "out-value": { type: "tensor" },
      },
    },
  },
};

export function createDefaultNode(
  type: NodeType,
  position: Position,
  id: string
): Node {
  const baseConfig = NODE_CONFIGS[type];

  const config: any = structuredClone(baseConfig);

  // Initialiser les states pour chaque handle d'inputs et outputs
  if (config.ports) {
    ["inputs", "outputs"].forEach((portType) => {
      const portGroup = config.ports![portType as "inputs" | "outputs"];
      if (portGroup) {
        Object.keys(portGroup).forEach((handleId) => {
          if (!portGroup[handleId].states) {
            portGroup[handleId].states = {
              isBusy: false,
            };
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
    states: {
      selected: false,
      dragged: false,
    },
    content: config,
  };
}
