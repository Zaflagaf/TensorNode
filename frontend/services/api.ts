import {
  toastError,
  toastSuccess,
} from "../components/ui/workflow-interface/toast/toast";
import { ButtonStatus, Edge, Node } from "../types";

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

interface ApiError {
  title?: string;
  message: string;
}

/**
 * Appel générique vers le backend Python via Next.js.
 * Gère les statuts, erreurs et retours JSON de manière propre.
 */
const fetchPython = async <T>(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  body?: any,
  setStatus?: (status: ButtonStatus) => void
): Promise<T | undefined> => {
  setStatus?.("loading");

  const isFormData = body instanceof FormData;
  const headers: Record<string, string> =
    isFormData || method === "GET"
      ? {}
      : { "Content-Type": "application/json" };

  try {
    const url =
      method === "GET" && body
        ? `${PYTHON_API_BASE}${endpoint}?${new URLSearchParams(
            body
          ).toString()}`
        : `${PYTHON_API_BASE}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers,
      body: method === "POST" && !isFormData ? JSON.stringify(body) : body,
    });

    let data: (T & { message?: string; title?: string }) | any;
    try {
      data = await response.json();
    } catch {
      throw {
        message: "Invalid response: backend did not return JSON.",
      } as ApiError;
    }

    if (!response.ok) {
      throw {
        message: data?.error ?? `API Error (${response.status})`,
        title: data?.title,
      } as ApiError;
    }

    if (data?.message) {
      toastSuccess({
        title: data.title ?? "Success",
        description: data.message,
      });
    }

    setStatus?.("success");
    return data as T;
  } catch (error: any) {
    toastError({
      title: error?.title ?? "Error",
      description: error?.message ?? "Unexpected error",
    });
    setStatus?.("error");
    return undefined;
  } finally {
    if (setStatus) setTimeout(() => setStatus("idle"), 3000);
  }
};

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
  const data = await fetchPython<{ message?: string }>(
    "/build_model",
    "POST",
    { nodes, edges, modelId, modelName },
    setStatus
  );
  if (!data) throw new Error("Failed to build");
};

/**
 * Récupérer l'architecture du modèle
 */
export const getModelArchitecture = async (
  id: string,
  setStatus?: (status: ButtonStatus) => void
) => {
  const res = await fetchPython<{ architecture: any[]; summary: any }>(
    "/get_model_architecture",
    "POST",
    { id },
    setStatus
  );
  return (
    res ?? {
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
  await fetchPython<void>(
    "/compile_model",
    "POST",
    { id: modelId, optimizer, loss, metrics },
    setStatus
  );
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
  await fetchPython<void>(
    "/train_step",
    "POST",
    { nodes, edges, hyperparameters, metrics },
    setStatus
  );
};

export const composeModel = async (
  nodes: Record<string, Node>,
  edges: Record<string, Edge>,
  hyperparameters: Record<string, number>,
  metrics: string[],
  setStatus?: (status: ButtonStatus) => void
): Promise<void> => {
  await fetchPython<void>(
    "/compose",
    "POST",
    { nodes, edges, hyperparameters, metrics },
    setStatus
  );
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
  await fetchPython<void>(
    "/fit_model",
    "POST",
    { id: modelId, features, labels, epochs, batchSize },
    setStatus
  );
};

/**
 * Prédiction
 */
export const predict = async (
  id: string,
  features: number[],
  setStatus?: (status: ButtonStatus) => void
): Promise<any[]> => {
  const res = await fetchPython<any[]>(
    "/predict",
    "POST",
    { id, features },
    setStatus
  );
  return res ?? [];
};

export const uploadImages = async (images: FormData): Promise<void> => {
  await fetch(`${PYTHON_API_BASE}/upload_images`, {
    method: "POST",
    headers: {},
    body: images,
  });
};

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

export const DownloadModel = async (
  modelId: string,
  modelName: string,
  type: string
) => {
  const blob = await fetchFile(`/${type}`, { modelId, modelName });
  if (!blob) return;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `model_${modelName}.keras`; // ou .h5 selon ton endpoint
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  toastSuccess({
    title: "Downloaded Successfully",
    description: `'${modelName}' download successfully`,
  });
};
