import { Prisma } from "@prisma/client";
import { prisma } from "../../infra/db/prisma";

type ExpenseUpsertInput = {
  deputyId: number;
  expenseTypeId?: string;
  ano: number;
  mes: number;
  dataDocumento?: Date;
  tipoDocumento?: string;
  numeroDocumento?: string;
  fornecedor?: string;
  cnpjCpf?: string;
  valorDocumento: Prisma.Decimal;
  valorGlosa: Prisma.Decimal;
  valorLiquido: Prisma.Decimal;
  urlDocumento?: string;
  expenseHash: string;
};

export class DespesasRepository {
  upsertExpense(input: ExpenseUpsertInput) {
    return prisma.expense.upsert({
      where: { expenseHash: input.expenseHash },
      create: input,
      update: input
    });
  }

  listByDeputyAndPeriod(deputyId: number, ano: number, mes: number, page: number, items: number) {
    return Promise.all([
      prisma.expense.count({ where: { deputyId, ano, mes } }),
      prisma.expense.findMany({
        where: { deputyId, ano, mes },
        orderBy: [{ dataDocumento: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * items,
        take: items
      })
    ]);
  }

  async listByMonth(ano: number, mes: number, page: number, items: number) {
    const offset = (page - 1) * items;
    const [total, rows] = await Promise.all([
      prisma.expense.count({ where: { ano, mes } }),
      prisma.$queryRaw<
        Array<{
          id: string;
          deputyId: number;
          deputyName: string;
          siglaPartido: string;
          siglaUf: string;
          dataDocumento: Date | null;
          numeroDocumento: string | null;
          fornecedor: string | null;
          valorLiquido: Prisma.Decimal;
          urlDocumento: string | null;
          categoryLabel: string | null;
        }>
      >(Prisma.sql`
        SELECT
          e."id" AS "id",
          e."deputyId" AS "deputyId",
          d."nome" AS "deputyName",
          d."siglaPartido" AS "siglaPartido",
          d."siglaUf" AS "siglaUf",
          e."dataDocumento" AS "dataDocumento",
          e."numeroDocumento" AS "numeroDocumento",
          e."fornecedor" AS "fornecedor",
          e."valorLiquido" AS "valorLiquido",
          e."urlDocumento" AS "urlDocumento",
          et."label" AS "categoryLabel"
        FROM "Expense" e
        INNER JOIN "Deputy" d ON d."id" = e."deputyId"
        LEFT JOIN "ExpenseType" et ON et."id" = e."expenseTypeId"
        WHERE e."ano" = ${ano}
          AND e."mes" = ${mes}
        ORDER BY e."dataDocumento" DESC NULLS LAST, e."createdAt" DESC
        LIMIT ${items}
        OFFSET ${offset}
      `),
    ]);

    return { total, rows };
  }
}
