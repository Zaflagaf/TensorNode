import { LogStatus, TerminalStore } from "@/frontend/types";
import { createId } from "@/frontend/utils/create/createId";
import { produce } from "immer";
import { create } from "zustand";

const useTerminalStore = create<TerminalStore>((set, get) => ({
  logs: [
    {
      id: "welcome-message",
      message: "Welcome to Tensornode!",
      status: LogStatus.info,
    },
  ],
  logsLenght: 0,
  actions: {
    addLog: (inputLog) => {
      const id = createId();
      set(
        produce((draft: TerminalStore) => {
          draft.logs.push({
            id,
            message: inputLog.message,
            status: inputLog.status,
          });
          draft.logsLenght = draft.logs.length;
          if (draft.logsLenght > 100) {
            draft.logs.shift();
          }
        })
      );
    },
  },
}));

export default useTerminalStore;
