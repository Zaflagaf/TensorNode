import { create } from "zustand";
import { ConnectionType } from "../schemas/connection";

export type ConnectionsType = {
  connection: ConnectionType | null;
  actions: {
    setConnection: (
      newConnection: ConnectionType | null 
    ) => void;
  };
};
export const useConnectionStore = create<ConnectionsType>((set, get) => ({
  connection: null,
  actions: {
    setConnection: (newConnection) =>
      set({ connection: newConnection }),
  },
}));
