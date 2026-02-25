import { prisma } from "../../infra/db/prisma";

export class ExpenseTypesRepository {
  upsertType(data: { id: string; label: string }) {
    return prisma.expenseType.upsert({
      where: { id: data.id },
      create: data,
      update: { label: data.label }
    });
  }

  findByLabel(label: string) {
    return prisma.expenseType.findFirst({
      where: { label: { equals: label, mode: "insensitive" } }
    });
  }

  listAll() {
    return prisma.expenseType.findMany({
      orderBy: { label: "asc" }
    });
  }
}
