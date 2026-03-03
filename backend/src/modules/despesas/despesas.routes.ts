import { FastifyInstance } from "fastify";
import { DespesasService } from "./despesas.service";
import { deputyIdParamSchema, despesasMesQuerySchema, despesasQuerySchema, despesasSyncQuerySchema } from "./despesas.schemas";

export async function despesasRoutes(app: FastifyInstance) {
  const service = new DespesasService();

  app.get("/api/despesas/tipos", { preHandler: [app.authenticate] }, async () => {
    const data = await service.listExpenseTypes();
    return { success: true, data };
  });

  app.get("/api/despesas", { preHandler: [app.authenticate] }, async (request, reply) => {
    const query = despesasMesQuerySchema.parse(request.query);
    const result = await service.listMonthExpenses(query);
    reply.header("Cache-Control", "no-store");
    return { success: true, ...result };
  });

  app.get("/api/deputados/:id/despesas", { preHandler: [app.authenticate] }, async (request) => {
    const params = deputyIdParamSchema.parse(request.params);
    const query = despesasQuerySchema.parse(request.query);
    if (process.env.DEBUG_PERIOD === "true") {
      request.log.info({
        tag: "detail-period",
        deputyId: params.id,
        ano: query.ano,
        mes: query.mes,
      });
    }
    const result = await service.listDeputyExpenses(params.id, query.ano, query.mes, query.pagina, query.itens);
    return { success: true, ...result };
  });

  app.post(
    "/api/deputados/:id/despesas/sync",
    {
      preHandler: [app.authenticate],
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute"
        }
      }
    },
    async (request) => {
      const params = deputyIdParamSchema.parse(request.params);
      const query = despesasSyncQuerySchema.parse(request.query);
      const data = await service.syncDeputyExpenses(params.id, query.ano, query.mes);
      return { success: true, data };
    }
  );
}
