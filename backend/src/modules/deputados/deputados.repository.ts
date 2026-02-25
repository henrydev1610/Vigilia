import { Prisma } from "@prisma/client";
import { prisma } from "../../infra/db/prisma";

type DeputyFilters = {
  uf?: string;
  partido?: string;
  search?: string;
};

type DeputyMonthTotalInput = {
  deputyId: number;
  ano: number;
  mes: number;
  totalCents: bigint;
  expensesCount: number;
  lastSyncedAt: Date;
  sourceVersion?: string | null;
};

export class DeputadosRepository {
  async upsertDeputy(data: {
    id: number;
    nome: string;
    siglaUf: string;
    siglaPartido: string;
    urlFoto: string;
    uri: string;
    email?: string;
  }) {
    return prisma.deputy.upsert({
      where: { id: data.id },
      create: data,
      update: data
    });
  }

  findById(id: number) {
    return prisma.deputy.findUnique({ where: { id } });
  }

  async list(filters: DeputyFilters, page: number, items: number) {
    const where: Prisma.DeputyWhereInput = {
      siglaUf: filters.uf,
      siglaPartido: filters.partido,
      nome: filters.search
        ? {
            contains: filters.search,
            mode: "insensitive"
          }
        : undefined
    };

    const [total, deputies] = await Promise.all([
      prisma.deputy.count({ where }),
      prisma.deputy.findMany({
        where,
        orderBy: { nome: "asc" },
        skip: (page - 1) * items,
        take: items
      })
    ]);

    return { total, deputies };
  }

  async listMonthlyTotals(ano: number, mes: number, limit: number, offset: number) {
    const rows = await prisma.expense.groupBy({
      by: ["deputyId"],
      where: { ano, mes },
      _sum: {
        valorLiquido: true
      },
      orderBy: {
        deputyId: "asc"
      },
      skip: offset,
      take: limit
    });

    return rows.map((row) => ({
      deputadoId: row.deputyId,
      totalMes: Number(row._sum.valorLiquido ?? 0)
    }));
  }

  async getMonthlyTotalByDeputy(deputyId: number, ano: number, mes: number) {
    const result = await prisma.expense.aggregate({
      where: {
        deputyId,
        ano,
        mes
      },
      _sum: {
        valorLiquido: true
      }
    });

    return Number(result._sum.valorLiquido ?? 0);
  }

  async getMonthlyTotalsByDeputyYear(deputyId: number, ano: number) {
    const rows = await prisma.deputyMonthTotal.findMany({
      where: { deputyId, ano },
      orderBy: { mes: "asc" },
      select: {
        mes: true,
        totalCents: true,
      },
    });

    return rows.map((row) => ({
      mes: row.mes,
      totalMes: Number(row.totalCents) / 100,
    }));
  }

  async listDeputiesWithMonthTotal(ano: number, mes: number, filters?: DeputyFilters) {
    const rows = await prisma.$queryRaw<
      Array<{
        id: number;
        nome: string;
        siglaUf: string;
        siglaPartido: string;
        urlFoto: string;
        uri: string;
        email: string | null;
        totalCents: bigint | number | string | null;
        expensesCount: number | null;
        lastSyncedAt: Date | null;
      }>
    >(Prisma.sql`
      SELECT
        d."id",
        d."nome",
        d."siglaUf",
        d."siglaPartido",
        d."urlFoto",
        d."uri",
        d."email",
        COALESCE(mt."totalCents", 0) AS "totalCents",
        COALESCE(mt."expensesCount", 0) AS "expensesCount",
        mt."lastSyncedAt" AS "lastSyncedAt"
      FROM "Deputy" d
      LEFT JOIN "DeputyMonthTotal" mt
        ON mt."deputyId" = d."id"
       AND mt."ano" = ${ano}
       AND mt."mes" = ${mes}
      WHERE
        (${filters?.uf ? Prisma.sql`d."siglaUf" = ${filters.uf}` : Prisma.sql`TRUE`})
        AND (${filters?.partido ? Prisma.sql`d."siglaPartido" = ${filters.partido}` : Prisma.sql`TRUE`})
        AND (${filters?.search ? Prisma.sql`d."nome" ILIKE ${`%${filters.search}%`}` : Prisma.sql`TRUE`})
      ORDER BY d."nome" ASC
    `);

    return rows.map((row) => ({
      ...row,
      totalMes: Number(row.totalCents ?? 0) / 100,
      totalCents: Number(row.totalCents ?? 0),
      expensesCount: Number(row.expensesCount ?? 0),
    }));
  }

  async getTotalByMonth(ano: number, mes: number) {
    const result = await prisma.deputyMonthTotal.aggregate({
      where: { ano, mes },
      _sum: { totalCents: true },
    });
    return Number(result._sum.totalCents ?? 0) / 100;
  }

  async getTotalsByMonthForYear(ano: number) {
    const rows = await prisma.deputyMonthTotal.groupBy({
      by: ["mes"],
      where: { ano },
      _sum: {
        totalCents: true,
      },
      orderBy: {
        mes: "asc",
      },
    });

    return rows.map((row) => ({
      mes: row.mes,
      total: Number(row._sum.totalCents ?? 0) / 100,
    }));
  }

  async listAllDeputyIds() {
    const rows = await prisma.deputy.findMany({
      select: { id: true },
      orderBy: { id: "asc" },
    });
    return rows.map((row) => row.id);
  }

  async upsertMonthTotals(rows: DeputyMonthTotalInput[]) {
    if (!rows.length) return;
    await prisma.$transaction(
      rows.map((row) =>
        prisma.deputyMonthTotal.upsert({
          where: {
            deputyId_ano_mes: {
              deputyId: row.deputyId,
              ano: row.ano,
              mes: row.mes,
            },
          },
          create: row,
          update: {
            totalCents: row.totalCents,
            expensesCount: row.expensesCount,
            lastSyncedAt: row.lastSyncedAt,
            sourceVersion: row.sourceVersion ?? undefined,
          },
        })
      )
    );
  }

  async getMonthTotalRow(deputyId: number, ano: number, mes: number) {
    return prisma.deputyMonthTotal.findUnique({
      where: {
        deputyId_ano_mes: {
          deputyId,
          ano,
          mes,
        },
      },
    });
  }

  async getMonthSyncMeta(ano: number, mes: number) {
    const [count, max] = await Promise.all([
      prisma.deputyMonthTotal.count({ where: { ano, mes } }),
      prisma.deputyMonthTotal.aggregate({
        where: { ano, mes },
        _max: { lastSyncedAt: true },
      }),
    ]);
    return {
      totalRows: count,
      lastSyncedAt: max._max.lastSyncedAt ?? null,
    };
  }

  async getExpenseAggregatesByMonth(ano: number, mes: number) {
    const rows = await prisma.$queryRaw<
      Array<{ deputyId: number; totalCents: bigint | string | number; expensesCount: bigint | string | number }>
    >(Prisma.sql`
      SELECT
        e."deputyId" AS "deputyId",
        COALESCE(ROUND(SUM(e."valorLiquido" * 100)), 0)::BIGINT AS "totalCents",
        COUNT(*)::BIGINT AS "expensesCount"
      FROM "Expense" e
      WHERE e."ano" = ${ano}
        AND e."mes" = ${mes}
      GROUP BY e."deputyId"
    `);

    return rows.map((row) => ({
      deputyId: Number(row.deputyId),
      totalCents: BigInt(row.totalCents ?? 0),
      expensesCount: Number(row.expensesCount ?? 0),
    }));
  }
}
