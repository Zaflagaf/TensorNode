import z from "zod";

export const ConnectionDataSchema = z.object({
  id: z.string(),
  label: z.string(),
  values: z.record(z.string(), z.any()),
});
export type ConnectionDataType = z.infer<typeof ConnectionDataSchema>;

export const ConnectionSchema = z.object({
  sourceNode: z.string(),
  sourceHandle: z.string(),
  type: z.string().optional(),
  data: z.union([ConnectionDataSchema, z.any()]).optional(),
});
export type ConnectionType = z.infer<typeof ConnectionSchema>;
