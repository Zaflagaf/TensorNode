export enum LogStatus {
  error = "error",
  success = "success",
  info = "info",
}

export interface Log {
  id: string;
  message: string;
  status: LogStatus;
}

export interface TerminalStore {
  logs: Log[];
  logsLenght: number;
  actions: {
    addLog: (log: Omit<Log, "id">) => void;
  };
}