import { z } from "zod";
import { sanitizeText } from "../../shared/sanitize";

export const listDeputiesQuerySchema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  itens: z.coerce.number().int().positive().max(100).default(50),
  mes: z.string().optional(),
  ano: z.coerce.number().int().min(2000).max(2100).optional(),
  mesNumero: z.coerce.number().int().min(1).max(12).optional(),
  mesNum: z.coerce.number().int().min(1).max(12).optional(),
  uf: z.string().length(2).optional().transform((value) => (value ? sanitizeText(value.toUpperCase()) : undefined)),
  partido: z.string().max(20).optional().transform((value) => (value ? sanitizeText(value.toUpperCase()) : undefined)),
  search: z.string().min(1).max(120).optional().transform((value) => (value ? sanitizeText(value) : undefined))
}).transform((input) => ({
  ...input,
  mes: input.mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(input.mes) ? input.mes : undefined,
  mesNumero: input.mes && /^\d{1,2}$/.test(input.mes) ? Number(input.mes) : input.mesNumero ?? input.mesNum,
}));

export const deputyIdParamsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const analyticsTotalsBaseSchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100),
  mes: z.coerce.number().int().min(1).max(12),
  limit: z.coerce.number().int().positive().max(100).default(100),
  offset: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().positive().optional(),
  pagina: z.coerce.number().int().positive().optional()
});

export const analyticsTotalsQuerySchema = analyticsTotalsBaseSchema.transform((input) => {
  const requestedPage = input.page ?? input.pagina ?? 1;
  const computedOffset = input.offset ?? (requestedPage - 1) * input.limit;
  return {
    ano: input.ano,
    mes: input.mes,
    limit: input.limit,
    offset: computedOffset,
    page: requestedPage
  };
});

export const deputyResumoQuerySchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100),
  mes: z.coerce.number().int().min(1).max(12)
});

export const deputyResumoAnualQuerySchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100),
});

export const deputadosResumoMesQuerySchema = z.object({
  mes: z.string().optional(),
  ano: z.coerce.number().int().min(2000).max(2100).optional(),
  mesNumero: z.coerce.number().int().min(1).max(12).optional(),
  mesNum: z.coerce.number().int().min(1).max(12).optional(),
}).transform((input, ctx) => {
  if (input.mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(input.mes)) {
    return { mes: input.mes };
  }
  const mesNumero = input.mes && /^\d{1,2}$/.test(input.mes) ? Number(input.mes) : input.mesNumero ?? input.mesNum;
  if (!input.ano || !mesNumero) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe mes (YYYY-MM) ou ano+mesNumero",
    });
    return z.NEVER;
  }
  return { mes: `${input.ano}-${String(mesNumero).padStart(2, "0")}` };
});

export const syncDeputadosMesBodySchema = z.object({
  ano: z.coerce.number().int().min(2000).max(2100),
  mes: z.coerce.number().int().min(1).max(12),
  force: z.coerce.boolean().optional().default(false),
});
