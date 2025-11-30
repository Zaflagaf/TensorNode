import {
  toastError,
  toastSuccess,
} from "../../components/ui/workflow-interface/general/primitives/toast";
import { useNodesStore } from "../../store/nodesStore";
import useTerminalStore from "../../store/panels-store/terminal-store";
import { ButtonStatus, Edge, LogStatus, Node } from "../../types";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

export type ApiMethod = "GET" | "POST";

interface APIResponse {
  data: any;
  message: string;
  status: string;
}

export async function api<APIResponse>(
  endpoint: string,
  {
    method = "POST",
    body,
    setStatus,
  }: {
    method?: ApiMethod;
    body?: any;
    setStatus?: (status: ButtonStatus) => void;
  } = {}
): Promise<APIResponse | undefined> {
  setStatus?.(ButtonStatus.loading);

  const isFormData = body instanceof FormData;
  const url =
    method === "GET" && body
      ? `${BASE}${endpoint}?${new URLSearchParams(body).toString()}`
      : `${BASE}${endpoint}`;

  try {
    const res = await fetch(url, {
      method,
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      body: isFormData ? body : JSON.stringify(body),
    });

    const data = (await res.json().catch(() => null)) as {
      message: string;
      status: string;
    };

    if (!res.ok) {
    }

    if (data?.message && res.ok) {
      useTerminalStore.getState().actions.addLog({
        message: data.message,
        status: data.status as LogStatus,
      });
    }

    setStatus?.(ButtonStatus.success);
    return data as APIResponse;
  } catch (err: any) {
    console.error("Failed to connect to the backend.");
    setStatus?.(ButtonStatus.error);
    return undefined;
  } finally {
    if (setStatus) setTimeout(() => setStatus(ButtonStatus.idle), 2000);
  }
}

/**
 * Construire le modèle
 */
export const buildModel = async (
  nodes: any,
  edges: any,
  modelId: string,
  modelName: string,
  setStatus?: (status: ButtonStatus) => void
) => {
  const data = (await api("/build_model", {
    body: { nodes, edges, modelId, modelName },
    setStatus,
  })) as APIResponse;
  const probNode = data?.data.problematic_nodes;
  useNodesStore.setState({ problematicNodes: probNode ?? [] });
  if (!data) throw new Error("Failed to build");
};

/**
 * Récupérer l'architecture du modèle
 */
export const getModelArchitecture = async (
  id: string,
  setStatus?: (status: ButtonStatus) => void
) => {
  const data = await api<{
    architecture: [];
    summary: {
      total_params: number;
      trainable_params: number;
      non_trainable_params: number;
    };
  }>("/get_model_architecture", {
    body: { id },
    setStatus,
  });

  return (
    data ?? {
      architecture: [],
      summary: {
        total_params: 0,
        trainable_params: 0,
        non_trainable_params: 0,
      },
    }
  );
};

/**
 * Compiler le modèle
 */
export const compileModel = async (
  modelId: string,
  optimizer: string,
  loss: string,
  metrics: string[],
  setStatus?: (status: ButtonStatus) => void
): Promise<void> => {
  await api<APIResponse>("/compile_model", {
    body: { id: modelId, optimizer, loss, metrics },
    setStatus,
  });
};

/**
 * Step d'entraînement
 */
export const trainStepModel = async (
  nodes: Record<string, Node>,
  edges: Record<string, Edge>,
  hyperparameters: Record<string, number>,
  metrics: string[],
  setStatus?: (status: ButtonStatus) => void
): Promise<void> => {
  await api<APIResponse>("/train_step", {
    body: { nodes, edges, hyperparameters, metrics },
    setStatus,
  });
};

export const computeOutputs = async (
  nodeId: string,
  nodes: Record<string, Node>,
  edges: Record<string, Edge>,
  setStatus?: (status: ButtonStatus) => void
): Promise<any> => {
  const res = await api<any>("/compute_outputs", {
    body: { nodeId, nodes, edges },
    setStatus,
  });

  return res
};

export const composeModel = async (
  nodes: Record<string, Node>,
  edges: Record<string, Edge>,
  hyperparameters: Record<string, number>,
  metrics: string[],
  setStatus?: (status: ButtonStatus) => void
): Promise<void> => {
  await api<APIResponse>("/compose", {
    body: { nodes, edges, hyperparameters, metrics },
    setStatus,
  });
};

/**
 * Fit complet du modèle
 */
export const fitModel = async (
  modelId: string,
  features: any,
  labels: any,
  epochs: number,
  batchSize: number,
  setStatus?: (status: ButtonStatus) => void
): Promise<void> => {
  await api<APIResponse>("/fit_model", {
    body: { id: modelId, features, labels, epochs, batchSize },
    setStatus,
  });
};

/**
 * Prédiction
 */
export const predict = async (id: string, features: number[]) => {
  const res = await api<APIResponse>("/predict", {
    body: { id, features },
  });
};

export async function specifyCSVCol(
  fileName: string,
  columnsType: Record<string, any>
) {
  await api<APIResponse>("/specify_csv_column", {
    body: { fileName: fileName, columnsType: columnsType },
  });
}

// pages/upload.js
export async function uploadFile(file: File) {
  const chunkSize = 5 * 1024 * 1024; // 5 Mo par chunk
  const totalChunks = Math.ceil(file.size / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("file", chunk, file.name);
    formData.append("index", i.toString());
    formData.append("totalChunks", totalChunks.toString());

    await api<void>("/upload_csv", {
      body: formData,
    });
  }
}

export const uploadImages = (form: FormData) =>
  api<void>("/upload_images", { body: form });

const fetchFile = async (
  endpoint: string,
  body?: any
): Promise<Blob | undefined> => {
  try {
    const res = await fetch(`${PYTHON_API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      toastError({
        title: "Download Failed",
        description: data.detail,
      });
      /* toast.error("Error", { description: data.detail }) */
      return undefined;
      /* throw new Error(`Erreur API (${res.status}) : ${text}`); */
    }

    return await res.blob();
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const downloadModel = async (
  modelId: string,
  modelName: string,
  type: string
) => {
  const data = await api<APIResponse>(`/${type}`, {
    body: { modelId, modelName },
  });
  if (!!!data?.data) return;

  // Décoder le base64 en ArrayBuffer
  const byteCharacters = atob(data?.data.encoded_file);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Créer un blob et télécharger
  const blob = new Blob([byteArray], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `model_${modelName}.keras`;
  a.click();
  URL.revokeObjectURL(url);

  toastSuccess({
    title: "Downloaded",
    description: `'${modelName}' downloaded successfully`,
  });
};
