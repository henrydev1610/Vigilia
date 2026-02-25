import { FastifyInstance } from "fastify";
import { createFavoriteSchema, deputyIdParamsSchema } from "./favoritos.schemas";
import { FavoritosService } from "./favoritos.service";

export async function favoritosRoutes(app: FastifyInstance) {
  const service = new FavoritosService();

  app.get("/api/favoritos", { preHandler: [app.authenticate] }, async (request) => {
    const data = await service.list(request.user.sub);
    return { success: true, data };
  });

  app.post("/api/favoritos", { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = createFavoriteSchema.parse(request.body);
    const data = await service.create(request.user.sub, body.deputyId);
    return reply.status(201).send({ success: true, data });
  });

  app.delete("/api/favoritos/:deputyId", { preHandler: [app.authenticate] }, async (request) => {
    const params = deputyIdParamsSchema.parse(request.params);
    const data = await service.remove(request.user.sub, params.deputyId);
    return { success: true, data };
  });
}
