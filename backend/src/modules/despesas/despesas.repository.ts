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
}
