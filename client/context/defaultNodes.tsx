type Vec2 = { x: number; y: number };

type NodeType = "dense" | "conv2d" | "model" | "compile" | "data" | string;

const defaultConfigs: Record<string, any> = {
  dense: {
    label: "Dense",
    values: {
      input: {
        layer: null,
        units: 10,
        activation: "relu",
        useBias: true,
      },
      output: { layer: null },
    },
  },
  conv2d: {
    label: "Conv2D",
    values: {
      input: {
        layer: null,
        units: 10,
        activation: "relu",
        kernel_size: 3,
        useBias: true,
      },
      output: { layer: null },
    },
  },
  model: {
    label: "Model",
    values: {
      input: {
        layer: null,
      },
      output: { model: null },
    },
  },
  compile: {
    label: "Compile",
    values: {
      input: { model: null },
      output: { model: null },
    },
  },
  data: {
    label: "Data",
    values: {
      input: {},
      output: { features: null, labels: null },
    },
  },
  input: {
    label: "Input",
    values: {
      input: {},
      output: {
        layer: [4],
      },
    },
  },
  fit: {
    label: "Fit",
    values: {
      input: {
        model: null,
        features: null,
        labels: null,
        epochs: 20,
        batchSize: 32,
        validationSplit: 0.2,
      },
      output: {
        model: null,
        history: null,
      },
    },
  },
  vector: {
    label: "Vector",
    values: {
      input: {},
      output: {
        data: [0.0, 0.0, 0.0],
      },
    },
  },
  predict: {
    label: "Predict",
    values: {
      input: {
        model: null,
        data: null,
      },
      output: {
        labels: null,
      },
    },
  },
  scaling: {
    label: "Scaling",
    values: {
      input: {
        data: null,
        schema: null,
      },
      output: {
        data: null,
      },
    },
  },
  labelEncoding: {
    label: "Label Encoding",
    values: {
      input: {
        labels: null,
        schema: null,
      },
      output: {
        data: null,
      },
    },
  },
  graph: {
    label: "Graph",
    values: {
      input: {
        data: null,
        labels: null,
      },
      output: {
        chart: null,
      },
    },
  },
};

export function defaultNode(type: NodeType, position: Vec2, id: string) {
  const config = defaultConfigs[type] ?? defaultConfigs["dense"];

  if (type === "model") {
    config.values = {
      ...config.values,
      output: {
        ...config.values.output,
        model: id,
      },
    };
  }

  return {
    id,
    position,
    type,
    isActive: false,
    data: config,
  };
}
