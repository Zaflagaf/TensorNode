import z from "zod";

export const EdgeDataSchema = z.object({
  label: z.string().optional(),
  values: z.record(z.string(), z.any()).optional(),
});
export type EdgeDataType = z.infer<typeof EdgeDataSchema>;

export const EdgeSchema = z.object({
  id: z.string(),
  sourceNode: z.string(),
  sourceHandle: z.string(),
  targetNode: z.string(),
  targetHandle: z.string(),
  type: z.string().optional(),
  data: z.union([EdgeDataSchema, z.any()]).optional(),
});
export type EdgeType = z.infer<typeof EdgeSchema>;
