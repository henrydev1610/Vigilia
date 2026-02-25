import { Prisma } from "@prisma/client";
import { prisma } from "../../infra/db/prisma";
import { redis } from "../../infra/redis/client";
import { SalarioService } from "../deputados/salario.service";

const ONE_HOUR_SECONDS = 60 * 60;

type RankingRow = {
  deputyId: number;
  total: Prisma.Decimal;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto: string;
};

export class RankingService {
  private readonly salarioService = new SalarioService();

  async getCeapRanking(ano: number, mes: number, limit: number) {
    const cacheKey = `cache:ranking:ceap:${ano}:${mes}:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const rows = await prisma.$queryRaw<RankingRow[]>`
      SELECT
        e."deputyId" as "deputyId",
        SUM(e."valorDocumento") as "total",
        d.nome as "nome",
        d."siglaPartido" as "siglaPartido",
        d."siglaUf" as "siglaUf",
        d."urlFoto" as "urlFoto"
      FROM "Expense" e
      INNER JOIN "Deputy" d ON d.id = e."deputyId"
      WHERE e.ano = ${ano} AND e.mes = ${mes}
      GROUP BY e."deputyId", d.nome, d."siglaPartido", d."siglaUf", d."urlFoto"
      ORDER BY "total" DESC
      LIMIT ${limit}
    `;

    const salario = await this.salarioService.getCurrentSalary();
    const ranking = rows.map((row, index) => ({
      posicao: index + 1,
      deputyId: row.deputyId,
      nome: row.nome,
      siglaPartido: row.siglaPartido,
      siglaUf: row.siglaUf,
      urlFoto: row.urlFoto,
      total: Number(row.total),
      salario
    }));

    const response = {
      data: ranking,
      meta: {
        ano,
        mes,
        limit
      }
    };

    await redis.set(cacheKey, JSON.stringify(response), "EX", ONE_HOUR_SECONDS);
    return response;
  }
}
