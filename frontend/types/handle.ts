import React from "react";
import { Node } from "./nodes/node";

export type HandleType = "source" | "target";

export interface HandleStates {
  isBusy: boolean;
}

export interface Handle {
  value?: any;
  port?: string;
  type?: any;
  states?: HandleStates;
}

export interface HandleComponent {
  children: React.ReactNode;
  type: HandleType;
  handleId: string; // aka port
  node: Node;
}

export type Handles = Record<string, Handle>;
