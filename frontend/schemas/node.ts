import z from "zod";

/**
 * Schéma pour les données internes d’un nœud.
 */
export const NodeContentSchema = z.object({
  name: z.string().describe("Étiquette du nœud"),
  width: z.number().optional(),
  height: z.number().optional(),
  ports: z.object({
    inputs: z
      .union([z.record(z.string(), z.any()), z.any()])
      .describe("Entrées du nœud"),
    outputs: z
      .union([z.record(z.string(), z.any()), z.any()])
      .describe("Sorties du nœud"),
  }),
});
export type NodeContentType = z.infer<typeof NodeContentSchema>;

/**
 * Schéma principal d’un nœud dans le graphe.
 */
export const NodeSchema = z.object({
  id: z.string().describe("Identifiant unique du nœud"),
  type: z.string().describe("Type du nœud (ex: Input, Dense, Model, ...)"),
  position: z.object({
    x: z.number().describe("Position X du nœud dans l'éditeur"),
    y: z.number().describe("Position Y du nœud dans l'éditeur"),
  }).optional(),
  selected: z
    .boolean()
    .describe("Indique si le nœud est sélectionné par l'utilisateur ou pas"),
  layer: z
    .number()
    .optional()
    .describe("Index du nœud pour déterminer son ordre d'affichage"),
  content: NodeContentSchema,
});
export type NodeType = z.infer<typeof NodeSchema>;
