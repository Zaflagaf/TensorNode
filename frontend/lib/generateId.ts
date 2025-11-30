/**
 * Génère un ID unique aléatoire
 * @param prefix Optionnel : ajoute un préfixe au début de l'ID
 * @returns string
 */
export function generateId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}