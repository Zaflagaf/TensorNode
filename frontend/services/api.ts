import { EdgeType } from "../schemas/edge";
import { NodeType } from "../schemas/node";
import { ButtonStatus } from "../schemas/types/general";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

// ----------------------- Nodes fetch -----------------------
export async function fetchPythonJson<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur API: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function buildModel(
  nodes: Record<string, NodeType>,
  edges: Record<string, EdgeType>,
  id: string,
  setStatus: (status: ButtonStatus) => void
) {
  try {
    await fetchPythonJson("/build_model", "POST", { nodes, edges, id });
  } catch (err) {
    setStatus("error");
  }
}

export async function getModelArchitecture(
  id: string,
  setStatus: (status: ButtonStatus) => void
) {
  try {
    const res = await fetchPythonJson("/get_model_architecture", "POST", { id });
    setStatus("success");
    return res;
  } catch (err) {
    console.error(err);
    setStatus("error");

    return [];
  }
}

export async function compileModel(
  modelId: string,
  optimizer: string,
  loss: string,
  metrics: string[],
  setStatus: (status: ButtonStatus) => void
) {
  try {
    setStatus("loading");

    const res = await fetchPythonJson("/compile_model", "POST", {
      id: modelId,
      optimizer,
      loss,
      metrics,
    });

    setStatus("success");

    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  } catch (error) {
    console.error("Erreur lors de la compilation du modèle", error);
    setStatus("error");

    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  }
}

export async function fitModel(
  modelId: string,
  features: any,
  labels: any,
  epochs: number,
  batchSize: number,
  setStatus: (status: ButtonStatus) => void,
  setErrorMessage: (msg: string) => void
) {
  try {
    setStatus("loading");
    setErrorMessage("");

    const res = await fetchPythonJson("/fit_model", "POST", {
      id: modelId,
      features,
      labels,
      epochs,
      batchSize,
    });

    setStatus("success");

    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Une erreur inattendue est survenue.";
    console.error("❌ Échec de l'entraînement du modèle :", message);
    setStatus("error");
    setErrorMessage(message);

    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  }
}

export async function predict(id: string, features: number[]) {
  try {
    console.log(id,features)
    const res = await fetchPythonJson("/predict", "POST", { id, features });
    return res;
  } catch (err) {
    console.error("Erreur lors de la création du modèle:", err);
    return null;
  }
}

// ----------------------- DEV... -----------------------

// TODO fonctionnalité de sauvegarder son workflow (c'est le fetch là)
export async function saveWorkflow(
  nodes: Record<string, NodeType>,
  edges: Record<string, EdgeType>
) {
  try {
    const res = await fetch("/api/save-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nodes, edges }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to save workflow");
    }

    return data;
  } catch (err) {
    console.error("Error saving workflow:", err);
    throw err;
  }
}
