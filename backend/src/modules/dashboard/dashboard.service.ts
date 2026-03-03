import { Prisma } from "@prisma/client";
import { redis } from "../../infra/redis/client";
import { prisma } from "../../infra/db/prisma";
import { getExpenseCategoriesByMonth } from "../despesas/expense-categories";

const DASHBOARD_CACHE_TTL_SECONDS = 60 * 5;

type DashboardInput = {
  ano?: number;
  mes?: number;
  userId: string;
};

type MonthCategory = {
  nome: "Combustível" | "Passagens Aéreas" | "Manutenção Gabinete" | "Divulgação";
  total: number;
  percentual: number;
};

type RankingItem = {
  deputyId: number;
  nome: string;
  siglaPartido: string;
  siglaUf: string;
  urlFoto: string;
  total: number;
};

function toNumberValue(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value instanceof Prisma.Decimal) return value.toNumber();
  return 0;
}

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateVariation(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return roundTo2(((current - previous) / previous) * 100);
}

function resolveBrazilMonthYear() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const yearRaw = parts.find((part) => part.type === "year")?.value;
  const monthRaw = parts.find((part) => part.type === "month")?.value;

  const ano = Number(yearRaw);
  const mes = Number(monthRaw);

  return {
    ano: Number.isFinite(ano) ? ano : new Date().getFullYear(),
    mes: Number.isFinite(mes) ? mes : new Date().getMonth() + 1,
  };
}

function previousMonth(ano: number, mes: number) {
  if (mes === 1) return { ano: ano - 1, mes: 12 };
  return { ano, mes: mes - 1 };
}

function normalizeCategories(rawCategories: Array<{ name: string; total: number }>, monthTotal: number): MonthCategory[] {
  const expectedOrder: MonthCategory["nome"][] = [
    "Combustível",
    "Passagens Aéreas",
    "Manutenção Gabinete",
    "Divulgação",
  ];

  const map = new Map<string, number>();
  rawCategories.forEach((item) => {
    map.set(item.name, toNumberValue(item.total));
  });

  return expectedOrder.map((nome) => {
    const total = roundTo2(map.get(nome) ?? 0);
    const percentualBase = monthTotal > 0 ? (total / monthTotal) * 100 : 0;
    return {
      nome,
      total,
      percentual: roundTo2(Math.max(0, Math.min(100, percentualBase))),
    };
  });
}

export class DashboardService {
  private async readCache<T>(cacheKey: string): Promise<T | null> {
    try {
      const cached = await redis.get(cacheKey);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch {
      return null;
    }
  }

  private async writeCache(cacheKey: string, value: unknown, ttlSeconds: number) {
    try {
      await redis.set(cacheKey, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      return;
    }
  }

  async getResumo(input: DashboardInput) {
    const baseRef = resolveBrazilMonthYear();
    const ano = input.ano ?? baseRef.ano;
    const mes = input.mes ?? baseRef.mes;
    const prev = previousMonth(ano, mes);
    const cacheKey = `cache:dashboard:resumo:${ano}:${mes}`;

    const cached = await this.readCache<{
      totalMesAtual: number;
      totalMesAnterior: number;
      variacaoMensalPct: number;
      variacaoAnualPct: number;
      maiorGasto: RankingItem | null;
      categorias: MonthCategory[];
      ranking: RankingItem[];
      generatedAt: string;
    }>(cacheKey);

    let baseData = cached;

    if (!baseData) {
      const [
        totalAtualAgg,
        totalAnteriorAgg,
        totalAnoAtualAgg,
        totalAnoAnteriorAgg,
        topDeputiesRows,
        categoryRowsRaw,
      ] = await Promise.all([
        prisma.deputyMonthTotal.aggregate({
          where: { ano, mes },
          _sum: { totalCents: true },
        }),
        prisma.deputyMonthTotal.aggregate({
          where: { ano: prev.ano, mes: prev.mes },
          _sum: { totalCents: true },
        }),
        prisma.deputyMonthTotal.aggregate({
          where: { ano, mes: { lte: mes } },
          _sum: { totalCents: true },
        }),
        prisma.deputyMonthTotal.aggregate({
          where: { ano: ano - 1, mes: { lte: mes } },
          _sum: { totalCents: true },
        }),
        prisma.$queryRaw<
          Array<{
            deputyId: number;
            nome: string;
            siglaPartido: string;
            siglaUf: string;
            urlFoto: string;
            total: number;
          }>
        >(Prisma.sql`
          SELECT
            mt."deputyId" AS "deputyId",
            d."nome" AS "nome",
            d."siglaPartido" AS "siglaPartido",
            d."siglaUf" AS "siglaUf",
            d."urlFoto" AS "urlFoto",
            (mt."totalCents"::DOUBLE PRECISION / 100.0) AS "total"
          FROM "DeputyMonthTotal" mt
          INNER JOIN "Deputy" d ON d."id" = mt."deputyId"
          WHERE mt."ano" = ${ano}
            AND mt."mes" = ${mes}
            AND mt."totalCents" > 0
          ORDER BY mt."totalCents" DESC
          LIMIT 10
        `),
        getExpenseCategoriesByMonth(ano, mes),
      ]);

      const totalMesAtual = roundTo2(toNumberValue(totalAtualAgg._sum.totalCents) / 100);
      const totalMesAnterior = roundTo2(toNumberValue(totalAnteriorAgg._sum.totalCents) / 100);
      const totalAnoAtual = roundTo2(toNumberValue(totalAnoAtualAgg._sum.totalCents) / 100);
      const totalAnoAnterior = roundTo2(toNumberValue(totalAnoAnteriorAgg._sum.totalCents) / 100);

      const ranking: RankingItem[] = topDeputiesRows.map((row) => ({
        deputyId: Number(row.deputyId),
        nome: row.nome,
        siglaPartido: row.siglaPartido,
        siglaUf: row.siglaUf,
        urlFoto: row.urlFoto,
        total: roundTo2(toNumberValue(row.total)),
      }));

      baseData = {
        totalMesAtual,
        totalMesAnterior,
        variacaoMensalPct: calculateVariation(totalMesAtual, totalMesAnterior),
        variacaoAnualPct: calculateVariation(totalAnoAtual, totalAnoAnterior),
        maiorGasto: ranking[0] ?? null,
        categorias: normalizeCategories(categoryRowsRaw, totalMesAtual),
        ranking,
        generatedAt: new Date().toISOString(),
      };

      await this.writeCache(cacheKey, baseData, DASHBOARD_CACHE_TTL_SECONDS);
    }

    const monitoredAlerts = await prisma.favorite.count({
      where: {
        userId: input.userId,
        deputy: {
          monthTotals: {
            some: {
              ano,
              mes,
              totalCents: { gt: BigInt(0) },
            },
          },
        },
      },
    });

    return {
      data: {
        ano,
        mes,
        totalMesAtual: baseData.totalMesAtual,
        totalMesAnterior: baseData.totalMesAnterior,
        variacaoMensalPct: baseData.variacaoMensalPct,
        variacaoAnualPct: baseData.variacaoAnualPct,
        maiorGasto: baseData.maiorGasto,
        categorias: baseData.categorias,
        ranking: baseData.ranking,
        alertsCount: monitoredAlerts,
      },
      meta: {
        timezone: "America/Sao_Paulo",
        generatedAt: baseData.generatedAt,
      },
    };
  }
}
