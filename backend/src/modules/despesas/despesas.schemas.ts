import { z } from "zod";

export const despesasQuerySchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100),
  mes: z.coerce.number().int().min(1).max(12),
  pagina: z.coerce.number().int().positive().default(1),
  itens: z.coerce.number().int().positive().max(100).default(50)
});

export const despesasSyncQuerySchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100),
  mes: z.coerce.number().int().min(1).max(12)
});

export const deputyIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
});
