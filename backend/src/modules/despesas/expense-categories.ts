import { Prisma } from "@prisma/client";
import { prisma } from "../../infra/db/prisma";

export type ExpenseCategorySummary = {
  name: string;
  total: number;
  percent: number;
};

function roundTo2(value: number) {
  return Math.round(value * 100) / 100;
}

export async function getExpenseCategoriesByMonth(ano: number, mes: number): Promise<ExpenseCategorySummary[]> {
  const rows = await prisma.$queryRaw<Array<{ name: string; total: number }>>(Prisma.sql`
    WITH normalized AS (
      SELECT
        TRANSLATE(
          UPPER(COALESCE(et."label", '')),
          'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ',
          'AAAAAEEEEIIIIOOOOOUUUUC'
        ) AS normalized_label,
        e."valorLiquido"::DOUBLE PRECISION AS total_value
      FROM "Expense" e
      LEFT JOIN "ExpenseType" et ON et."id" = e."expenseTypeId"
      WHERE e."ano" = ${ano}
        AND e."mes" = ${mes}
    )
    SELECT
      CASE
        WHEN normalized_label LIKE '%COMBUST%' THEN 'Combustível'
        WHEN normalized_label LIKE '%PASSAG%' AND normalized_label LIKE '%AERE%' THEN 'Passagens Aéreas'
        WHEN normalized_label LIKE '%DIVULG%' THEN 'Divulgação'
        WHEN normalized_label LIKE '%MANUTEN%'
          OR normalized_label LIKE '%ESCRITORIO%'
          OR normalized_label LIKE '%GABINETE%' THEN 'Manutenção Gabinete'
        ELSE 'Outros'
      END AS "name",
      COALESCE(SUM(total_value), 0)::DOUBLE PRECISION AS "total"
    FROM normalized
    GROUP BY 1
    ORDER BY "total" DESC
  `);

  const grandTotal = rows.reduce((acc, item) => acc + Number(item.total || 0), 0);

  return rows.map((item) => {
    const total = roundTo2(Number(item.total || 0));
    const percent = grandTotal > 0 ? roundTo2((total / grandTotal) * 100) : 0;
    return {
      name: item.name,
      total,
      percent,
    };
  });
}

