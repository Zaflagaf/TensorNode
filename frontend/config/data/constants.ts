import { Activations } from "@/frontend/types/function";

export const ACTIVATIONS = Object.values(Activations) as Activations[];

export const LOSSES: Record<string, string[]> = {
  Régression: [
    "mean_squared_error",
    "mse",
    "mean_absolute_error",
    "mae",
    "mean_absolute_percentage_error",
    "mape",
    "mean_squared_logarithmic_error",
    "msle",
    "huber",
    "log_cosh",
  ],
  Classification: [
    "binary_crossentropy",
    "categorical_crossentropy",
    "sparse_categorical_crossentropy",
    "kullback_leibler_divergence",
    "kld",
    "poisson",
  ],
  "Similarité / probabilités": [
    "cosine_similarity",
    "kl_divergence",
    "binary_focal_crossentropy",
  ],
  "Spécifiques (tf-addons / custom)": ["dice_loss", "tversky_loss", "hinge"],
  "Généraux / expérimentaux": ["logcosh", "mean_squared_log_error"],
};
