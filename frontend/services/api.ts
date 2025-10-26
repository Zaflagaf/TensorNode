import { toast } from "sonner";
import { ButtonStatus, Edge, Node } from "../types";

const API_BASE = "/api/python";

/**
 * Appel générique vers le backend Python via Next.js.
 * Gère les statuts, erreurs et retours JSON de manière propre.
 */
const fetchPython = async <T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
  body?: any,
  setStatus?: (status: ButtonStatus) => void
): Promise<T | undefined> => {
  setStatus?.("loading");
  const isFormData = body instanceof FormData;
  const headers: any = isFormData ? {} : { "Content-Type": "application/json" };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    // Tente de parser le JSON (sinon, toast d’erreur lisible)
    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new Error(
        "Réponse non valide : le backend n’a pas renvoyé de JSON."
      );
    }

    // Si le backend renvoie une erreur HTTP
    if (!response.ok) {
      const message = data?.error ?? `Erreur API (${response.status})`;
      throw new Error(message);
    }

    // Message de succès du backend (optionnel)
    if (data?.message) {
      toast("Success", { description: data.message });
    }

    setStatus?.("success");
    return data as T;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue.";
    toast("Error", { description: message });
    setStatus?.("error");
    return undefined;
  } finally {
    if (setStatus) {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }
};

/**
 * Construire le modèle
 */
export const buildModel = async (
  nodes: Record<string, Node>,
  edges: Record<string, Edge>,
  id: string,
  setStatus?: (status: ButtonStatus) => void
) => {
  const data = await fetchPython<{
    message?: string;
  }>("/build_model", "POST", { nodes, edges, id }, setStatus);

  if (!data) throw new Error("Failed to build");
};

/**
 * Récupérer l'architecture du modèle
 */
export const getModelArchitecture = async (
  id: string,
  setStatus?: (status: ButtonStatus) => void
): Promise<{
  architecture: any[];
  summary: {
    total_params: number;
    trainable_params: number;
    non_trainable_params: number;
  };
}> => {
  const res = await fetchPython<{
    architecture: any[];
    summary: {
      total_params: number;
      trainable_params: number;
      non_trainable_params: number;
    };
  }>("/get_model_architecture", "POST", { id }, setStatus);
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

const PYTHON_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL!;

export const uploadImages = async (images: FormData): Promise<void> => {
  console.log(images);

  await fetch(`${PYTHON_API_BASE}/upload_images`, {
    method: "POST",
    headers: {},
    body: images,
  });
};
