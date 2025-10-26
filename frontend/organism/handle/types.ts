export interface HandleStates {
  isBusy: boolean;
}

export interface Handle {
  value?: any;
  port?: string;
  type?: any;
  states: HandleStates;
}

export type Handles = Record<string, Handle>;
