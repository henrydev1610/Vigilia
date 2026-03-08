import { FastifyInstance } from "fastify";
import { deleteMeSchema, updateMeSchema, updateMyPasswordSchema, updateMyProfileSchema } from "./users.schemas";
import { UsersService } from "./users.service";

export async function usersRoutes(app: FastifyInstance) {
  const usersService = new UsersService();

  app.get("/api/users/me", { preHandler: [app.authenticate] }, async (request) => {
    const data = await usersService.getMe(request.user.sub);
    return { success: true, data };
  });

  app.patch("/api/users/me", { preHandler: [app.authenticate] }, async (request) => {
    const body = updateMeSchema.parse(request.body);
    const data = await usersService.updateMe(request.user.sub, body);
    return { success: true, data };
  });

  app.patch("/api/users/me/password", { preHandler: [app.authenticate] }, async (request) => {
    const body = updateMyPasswordSchema.parse(request.body);
    const data = await usersService.updateMyPassword(request.user.sub, body.currentPassword, body.newPassword);
    return { success: true, data };
  });

  app.get("/api/users/me/profile", { preHandler: [app.authenticate] }, async (request) => {
    const data = await usersService.getMyProfile(request.user.sub);
    return { success: true, data };
  });

  app.patch("/api/users/me/profile", { preHandler: [app.authenticate] }, async (request) => {
    const body = updateMyProfileSchema.parse(request.body);
    const data = await usersService.updateMyProfile(request.user.sub, body);
    return { success: true, data };
  });

  app.delete("/api/users/me", { preHandler: [app.authenticate] }, async (request) => {
    const body = deleteMeSchema.parse(request.body);
    const data = await usersService.deleteMe(request.user.sub, body.password);
    return { success: true, data };
  });
}
