import { z } from "zod";
import { sanitizeText } from "../../shared/sanitize";

export const updateMeSchema = z
  .object({
    name: z.string().min(2).max(120).transform(sanitizeText).optional(),
    email: z.string().email().transform((value) => sanitizeText(value.toLowerCase())).optional()
  })
  .refine(
    (data) => {
      if (!data.name && !data.email) return false;
      return true;
    },
    {
      message: "Informe ao menos um campo para atualizar",
      path: ["name"]
    }
  );

export const deleteMeSchema = z.object({
  password: z.string().min(3).max(120)
});

export const updateMyPasswordSchema = z
  .object({
    currentPassword: z.string().min(3).max(120),
    newPassword: z.string().min(3).max(120)
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "A nova senha deve ser diferente da atual",
    path: ["newPassword"]
  });
