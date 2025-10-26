export const ACTIVATIONS = [
  "relu", // Très courant, rapide, excellent pour la plupart des couches cachées
  "tanh", // Souvent utilisé pour les réseaux récurrents ou normalisation [-1,1]
  "swish", // Alternative moderne à ReLU, parfois plus performante
  "sigmoid", // Utile pour les sorties binaires (classification 0/1)
  "softmax", // Utilisé pour les sorties multi-classes (probabilités)
  "gelu", // Activation récente, performante sur certains modèles profonds
  "softplus", // Lisse, similaire à ReLU, moins couramment utilisé
  "selu", // Self-normalizing, parfois utilisé dans des architectures spécifiques
  "elu", // Variante de ReLU avec valeurs négatives, stabilise l’apprentissage
  "mish", // Activation moderne, lisse, efficace mais un peu plus lourde
  "softsign", // Rarement utilisé, similaire à tanh mais plus lent
  "linear", // Identité, utile pour les sorties régressives
  "exponential", // Rare, transforme la sortie en exponentielle, pour cas très spécifiques
];

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

