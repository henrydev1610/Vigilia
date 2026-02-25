import { z } from "zod";

export const rankingQuerySchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100),
  mes: z.coerce.number().int().min(1).max(12),
  limit: z.coerce.number().int().positive().max(100).default(50)
});
