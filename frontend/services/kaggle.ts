import { toast } from "sonner";
import { ButtonStatus } from "../types";

const API_BASE = "/api/kaggle";

/**
 * Fonction générique pour interagir avec ton proxy Next.js vers l'API Kaggle.
 * Gère les slugs contenant des "/", encode automatiquement, et affiche les toasts.
 */
export const fetchKaggle = async <T>(
  dataset: string, // ex: "joosthazelzet/lego-brick-images"
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any,
  setStatus?: (status: ButtonStatus) => void
): Promise<T | undefined> => {
  try {
    setStatus?.("loading");

    // Encode le nom du dataset pour éviter que Next.js pense que c’est un sous-dossier
    const encodedDataset = encodeURIComponent(dataset);

    const res = await fetch(`${API_BASE}/${encodedDataset}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method !== "GET" && body ? JSON.stringify(body) : undefined,
    });

    let data: any;
    try {
      data = await res.json();
    } catch {
      toast("Error", {
        description: "La réponse du backend Kaggle n'est pas un JSON valide.",
      });
      throw new Error("Backend Kaggle non-JSON");
    }

    if (!res.ok) {
      const message = data?.error ?? `Erreur API Kaggle: ${res.status}`;
      toast("Error", { description: message });
      throw new Error(message);
    }

    // Message de succès si le backend en renvoie un
    if (data?.message) toast("Success", { description: data.message });

    setStatus?.("success");
    return data as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inattendue";
    toast("Error", { description: message });
    console.error("❌ fetchKaggle error:", message);
    setStatus?.("error");
    return undefined;
  } finally {
    if (setStatus) setTimeout(() => setStatus("idle"), 3000);
  }
};
