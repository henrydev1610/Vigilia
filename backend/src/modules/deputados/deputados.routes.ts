import { FastifyInstance } from "fastify";
import {
  analyticsTotalsQuerySchema,
  deputadosResumoMesQuerySchema,
  deputyResumoAnualQuerySchema,
  deputyIdParamsSchema,
  deputyResumoQuerySchema,
  listDeputiesQuerySchema,
  syncDeputadosMesBodySchema,
} from "./deputados.schemas";
import { DeputadosService } from "./deputados.service";

export async function deputadosRoutes(app: FastifyInstance) {
  const service = new DeputadosService();

  app.get("/api/deputados", { preHandler: [app.authenticate] }, async (request) => {
    const query = listDeputiesQuerySchema.parse(request.query);
    const data = await service.listDeputies(query);
    return { success: true, ...data };
  });

  app.get(
    "/api/deputados/resumo",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: {
          max: 90,
          timeWindow: "1 minute"
        }
      }
    },
    async (request) => {
      const query = deputadosResumoMesQuerySchema.parse(request.query);
      const result = await service.getResumoByMonth(query.mes);
      return { success: true, ...result };
    }
  );

  app.get("/api/deputados/:id", { preHandler: [app.authenticate] }, async (request) => {
    const params = deputyIdParamsSchema.parse(request.params);
    const data = await service.getDeputyById(params.id);
    return { success: true, data };
  });

  app.get(
    "/api/deputados/:id/resumo",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: {
          max: 120,
          timeWindow: "1 minute"
        }
      }
    },
    async (request) => {
      const params = deputyIdParamsSchema.parse(request.params);
      const query = deputyResumoQuerySchema.parse(request.query);
      const data = await service.getDeputyMonthlyResumo(params.id, query.ano, query.mes);
      return { success: true, data };
    }
  );

  app.get(
    "/api/deputados/:id/resumo-anual",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: {
          max: 120,
          timeWindow: "1 minute"
        }
      }
    },
    async (request) => {
      const params = deputyIdParamsSchema.parse(request.params);
      const query = deputyResumoAnualQuerySchema.parse(request.query);
      const data = await service.getDeputyYearResumo(params.id, query.ano);
      return { success: true, data };
    }
  );

  app.get(
    "/api/analytics/deputados/totais-mes",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: {
          max: 120,
          timeWindow: "1 minute"
        }
      }
    },
    async (request) => {
      const query = analyticsTotalsQuerySchema.parse(request.query);
      const data = await service.listMonthlyTotals(query.ano, query.mes, query.limit, query.offset, query.page);
      return { success: true, ...data };
    }
  );

  app.post(
    "/api/deputados/sync",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute"
        }
      }
    },
    async () => {
      const data = await service.syncAllDeputies();
      return { success: true, data };
    }
  );

  const syncMesOptions = {
    preHandler: [app.authenticate],
    config: {
      rateLimit: {
        max: 8,
        timeWindow: "1 minute",
      },
    },
  };

  app.post("/api/sync/deputados/mes", syncMesOptions, async (request, reply) => {
    const body = syncDeputadosMesBodySchema.parse(request.body);
    const data = await service.syncMonthTotalsAll(body.ano, body.mes, body.force);
    if (data.inProgress) {
      return reply.status(202).send({ success: true, data });
    }
    return { success: true, data };
  });

  app.post("/sync/deputados/mes", syncMesOptions, async (request, reply) => {
    const body = syncDeputadosMesBodySchema.parse(request.body);
    const data = await service.syncMonthTotalsAll(body.ano, body.mes, body.force);
    if (data.inProgress) {
      return reply.status(202).send({ success: true, data });
    }
    return { success: true, data };
  });
}
