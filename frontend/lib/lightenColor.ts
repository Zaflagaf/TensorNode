// Fonction helper
function lightenColor(hexa: string, amount: number): string {
  // Supprimer le # si présent
  if (hexa.startsWith("#")) {
    hexa = hexa.slice(1);
  }

  // Convertir le code hex en composantes RGB
  const r = parseInt(hexa.slice(0, 2), 16);
  const g = parseInt(hexa.slice(2, 4), 16);
  const b = parseInt(hexa.slice(4, 6), 16);

  // Appliquer l’éclaircissement
  const lighten = (c: number) =>
    Math.min(255, Math.round(c + (255 - c) * amount));
  const [lr, lg, lb] = [lighten(r), lighten(g), lighten(b)];

  // Reconstruire le code hex
  const toHex = (c: number) => c.toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;
}

export default lightenColor