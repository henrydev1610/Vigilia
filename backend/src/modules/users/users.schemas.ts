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

export const updateMyProfileSchema = z.object({
  avatarUrl: z.string().trim().url().max(2048).nullable().optional(),
  interestedParties: z.array(z.string().trim().min(1).max(24)).max(50).optional(),
  interestedStates: z.array(z.string().trim().min(1).max(24)).max(50).optional(),
  alertsEnabled: z.boolean().optional(),
  biometricEnabled: z.boolean().optional(),
  monitoringCount: z.number().int().min(0).max(999_999).optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "Informe ao menos um campo para atualizar",
  path: ["avatarUrl"]
});
