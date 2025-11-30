export enum Activations {
  relu = "relu", // Très courant, rapide, excellent pour la plupart des couches cachées
  tanh = "tanh", // Souvent utilisé pour les réseaux récurrents ou normalisation [-1,1]
  swish = "swish", // Alternative moderne à ReLU, parfois plus performante
  sigmoid = "sigmoid", // Utile pour les sorties binaires (classification 0/1)
  softmax = "softmax", // Utilisé pour les sorties multi-classes (probabilités)
  gelu = "gelu", // Activation récente, performante sur certains modèles profonds
  softplus = "softplus", // Lisse, similaire à ReLU, moins couramment utilisé
  selu = "selu", // Self-normalizing, parfois utilisé dans des architectures spécifiques
  elu = "elu", // Variante de ReLU avec valeurs négatives, stabilise l’apprentissage
  mish = "mish", // Activation moderne, lisse, efficace mais un peu plus lourde
  softsign = "softsign", // Rarement utilisé, similaire à tanh mais plus lent
  linear = "linear", // Identité, utile pour les sorties régressives
  exponential = "exponential", // Rare, transforme la sortie en exponentielle, pour cas très spécifiques
}
