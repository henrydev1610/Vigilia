import { FastifyInstance } from "fastify";
import { DespesasService } from "./despesas.service";
import { deputyIdParamSchema, despesasQuerySchema, despesasSyncQuerySchema } from "./despesas.schemas";

export async function despesasRoutes(app: FastifyInstance) {
  const service = new DespesasService();

  app.get("/api/despesas/tipos", { preHandler: [app.authenticate] }, async () => {
    const data = await service.listExpenseTypes();
    return { success: true, data };
  });

  app.get("/api/deputados/:id/despesas", { preHandler: [app.authenticate] }, async (request) => {
    const params = deputyIdParamSchema.parse(request.params);
    const query = despesasQuerySchema.parse(request.query);
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
