import { produce } from "immer";
import { create } from "zustand";

export type ColumnType = "Feature" | "Label" | "None";

export interface CSVSummary {
  columns: string[];
  sampleValues: Record<string, string[]>;
  rowCount: number;
}

export interface DatasetData {
  summary: CSVSummary;
  columnTypes: Record<string, ColumnType>;
}

interface DataStore {
  datasets: Record<string, DatasetData>;
  selectedDataset: string | null;

  searchTerm: string;
  addDataset: (name: string, data: DatasetData) => void;
  selectDataset: (name: string) => void;
  setSearchTerm: (term: string) => void;
  updateColumnType: (column: string, type: ColumnType) => void;
}

const useDataStore = create<DataStore>((set, get) => ({
  datasets: {},
  selectedDataset: null,
  searchTerm: "",
  addDataset: (name, data) =>
    set(
      produce((draft: DataStore) => {
        draft.datasets[name] = data;
      })
    ),
  selectDataset: (name) => set((state) => ({ selectedDataset: name })),
  setSearchTerm: (term) => set((state) => ({ searchTerm: term })),
  updateColumnType: (column, type) => {
    const selected = get().selectedDataset;
    if (!selected) return;
    set(
      produce((draft: DataStore) => {
        draft.datasets[selected].columnTypes[column] = type;
      })
    );
  },
}));

export default useDataStore;
