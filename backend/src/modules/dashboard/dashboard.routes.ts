import { FastifyInstance } from "fastify";
import { dashboardResumoQuerySchema } from "./dashboard.schemas";
import { DashboardService } from "./dashboard.service";

export async function dashboardRoutes(app: FastifyInstance) {
  const service = new DashboardService();

  app.get(
    "/api/dashboard/resumo",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: {
          max: 60,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const query = dashboardResumoQuerySchema.parse(request.query);
      const result = await service.getResumo({
        ano: query.ano,
        mes: query.mes,
        userId: request.user.sub,
      });
      reply.header("Cache-Control", "no-store");
      return { success: true, ...result };
    },
  );
}

