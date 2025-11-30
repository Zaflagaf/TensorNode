import { IconKeys } from "../icon";
import { NodeType } from "./node";

export type FirstOrderCategory =
  | "Input"
  | "Output"
  | "Layer"
  | "Compose"
  | "Data"
  | "Processing"
  | "Math"
  | "Experimental";

export interface Category {
  icon: IconKeys;
  color?: string;
  items: DefaultNode[];
}

export type DefaultNode = {
  name: string;
  type: NodeType;
  icon?: IconKeys;
  description?: string;
  ports: Record<PortsCluster, Port>;
};

export type PortsCluster = "inputs" | "outputs";

export type Port = Record<string, PortContent>;

export interface PortContent {
  value?:
    | boolean
    | boolean[]
    | string
    | string[]
    | number
    | number[]
    | never[]
    | any[];
  type?: PortType;
  port?: string;
  states?: {
    isBusy: boolean;
    [key: string]: any;
  };
}

export type PortType = "string" | "layer" | "tensor" | "default" | "images" | "boolean" | "error";

export type NodeConfigs = Record<FirstOrderCategory, Category>;