import { FastifyInstance } from "fastify";
import { rankingQuerySchema } from "./ranking.schemas";
import { RankingService } from "./ranking.service";

export async function rankingRoutes(app: FastifyInstance) {
  const service = new RankingService();

  const options = {
    preHandler: [app.authenticate],
    config: {
      rateLimit: {
        max: 20,
        timeWindow: "1 minute"
      }
    }
  };

  app.get("/api/ranking/ceap", options, async (request) => {
    const query = rankingQuerySchema.parse(request.query);
    const result = await service.getCeapRanking(query.ano, query.mes, query.limit);
    return { success: true, ...result };
  });

  app.get("/api/ranking/cecap", options, async (request) => {
    const query = rankingQuerySchema.parse(request.query);
    const result = await service.getCeapRanking(query.ano, query.mes, query.limit);
    return { success: true, ...result };
  });
}
