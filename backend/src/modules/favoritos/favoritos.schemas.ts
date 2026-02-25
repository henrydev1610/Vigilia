import { z } from "zod";

export const createFavoriteSchema = z.object({
  deputyId: z.coerce.number().int().positive()
});

export const deputyIdParamsSchema = z.object({
  deputyId: z.coerce.number().int().positive()
});
