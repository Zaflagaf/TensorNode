export type Vec2 = {
  x: number
  y: number
}

export type NodeType =
  | "dense"
  | "conv2d"
  | "model"
  | "compile"
  | "data"
  | "input"
  | "fit"
  | "vector"
  | "predict"
  | "scaling"
  | "labelEncoding"
  | "graph"
  | "batchNorm"

export type PortConfig = Record<string, any>

export interface NodeConfig {
  name: string
  width?: number
  height?: number
  ports: {
    inputs: PortConfig
    outputs: PortConfig
  }
}

export interface NodeData {
  id: string
  position: Vec2
  type: NodeType
  selected: boolean
  content: NodeConfig
}

const NODE_CONFIGS: Record<NodeType, NodeConfig> = {
  // Layer Nodes
  dense: {
    name: "Dense",
    ports: {
      inputs: {
        layer: null,
        units: 10,
        activation: "relu",
        useBias: true,
      },
      outputs: {
        layer: null,
      },
    },
  },

  conv2d: {
    name: "Conv2D",
    ports: {
      inputs: {
        layer: null,
        units: 10,
        activation: "relu",
        kernel_size: 3,
        useBias: true,
      },
      outputs: {
        layer: null,
      },
    },
  },

  input: {
    name: "Input",
    ports: {
      inputs: {
        shape: [4]
      },
      outputs: {
        layer: null,
      },
    },
  },

  // Model Nodes
  model: {
    name: "Model",
    width: 0,
    height: 0,
    ports: {
      inputs: {
        layer: null,
      },
      outputs: {
        model: null,
      },
    },
  },

  compile: {
    name: "Compile",
    ports: {
      inputs: {
        model: null,
      },
      outputs: {
        model: null,
      },
    },
  },

  // Training Nodes
  fit: {
    name: "Fit",
    ports: {
      inputs: {
        model: null,
        features: null,
        labels: null,
        epochs: 20,
        batchSize: 32,
        validationSplit: 0.2,
      },
      outputs: {
        model: null,
        history: null,
      },
    },
  },

  predict: {
    name: "Predict",
    ports: {
      inputs: {
        model: null,
        data: null,
      },
      outputs: {
        labels: null,
      },
    },
  },

  // Data Nodes
  data: {
    name: "Data",
    ports: {
      inputs: {},
      outputs: {
        features: null,
        labels: null,
      },
    },
  },

  vector: {
    name: "Vector",
    ports: {
      inputs: {},
      outputs: {
        data: [0, 0, 0],
      },
    },
  },

  // Processing Nodes
  scaling: {
    name: "Scaling",
    ports: {
      inputs: {
        data: null,
        schema: null,
      },
      outputs: {
        data: null,
      },
    },
  },

  labelEncoding: {
    name: "Label Encoding",
    ports: {
      inputs: {
        labels: null,
        schema: null,
      },
      outputs: {
        data: null,
      },
    },
  },

  // Visualization Nodes
  graph: {
    name: "Graph",
    ports: {
      inputs: {
        data: null,
        labels: null,
      },
      outputs: {
        chart: null,
      },
    },
  },
  batchNorm: {
    name: "BatchNorm",
    ports: {
      inputs: {
        layer: null,
        momentum: 0,
      },
      outputs: {
        layer: null,
      },
    },
  },
}

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T
  if (typeof obj === "object") {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  return obj
}

export function createDefaultNode(type: NodeType, position: Vec2, id: string): NodeData {
  const baseConfig = NODE_CONFIGS[type]

  if (!baseConfig) {
    console.warn(`Unknown node type: ${type}, falling back to dense`)
    return createDefaultNode("dense", position, id)
  }

  // Deep clone to avoid mutating the original config
  const config = deepClone(baseConfig)

  // Special handling for model nodes
  if (type === "model" && config.ports.outputs.model !== undefined) {
    config.ports.outputs.model = id
  }

  return {
    id,
    position,
    type,
    selected: false,
    content: config,
  }
}

export function getNodeConfig(type: NodeType): NodeConfig | null {
  return NODE_CONFIGS[type] || null
}

export function getAllNodeTypes(): NodeType[] {
  return Object.keys(NODE_CONFIGS) as NodeType[]
}

export function isValidNodeType(type: string): type is NodeType {
  return type in NODE_CONFIGS
}