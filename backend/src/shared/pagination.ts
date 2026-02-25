import { z } from "zod";

const paginationSchema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  itens: z.coerce.number().int().positive().max(100).default(50)
});

export function parsePagination(query: unknown) {
  return paginationSchema.parse(query);
}
