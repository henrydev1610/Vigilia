import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { CamaraClient } from "../../infra/http/camara-client";
import { deleteByPattern } from "../../infra/redis/cache-utils";
import { AppError } from "../../shared/errors/app-error";
import { DeputadosRepository } from "../deputados/deputados.repository";
import { DespesasRepository } from "./despesas.repository";
import { ExpenseTypesRepository } from "./expense-types.repository";
import { getExpenseCategoriesByMonth } from "./expense-categories";

function toDecimal(value: number | undefined): Prisma.Decimal {
  return new Prisma.Decimal(value ?? 0);
}

function normalize(value?: string): string {
  return (value ?? "").trim().toLowerCase();
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

export class DespesasService {
  private readonly camaraClient = new CamaraClient();
  private readonly despesasRepository = new DespesasRepository();
  private readonly deputiesRepository = new DeputadosRepository();
  private readonly expenseTypesRepository = new ExpenseTypesRepository();

  private buildExpenseHash(input: {
    deputyId: number;
    ano: number;
    mes: number;
    numeroDocumento?: string;
    dataDocumento?: string;
    valorDocumento?: number;
    fornecedor?: string;
  }) {
    const raw = [
      input.deputyId,
      input.ano,
      input.mes,
      normalize(input.numeroDocumento),
      normalize(input.dataDocumento),
      input.valorDocumento ?? 0,
      normalize(input.fornecedor)
    ].join("|");
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  async syncExpenseTypes() {
    const response = await this.camaraClient.listExpenseTypes();
    const normalized = response.dados
      .map((item) => ({
        id: item.cod === null || item.cod === undefined ? null : String(item.cod).trim(),
        label: item.nome?.trim() ?? null
      }))
      .filter((item): item is { id: string; label: string } => Boolean(item.id && item.label));

    await Promise.all(normalized.map((item) => this.expenseTypesRepository.upsertType(item)));
  }

  async listExpenseTypes() {
    let types = await this.expenseTypesRepository.listAll();
    if (!types.length) {
      await this.syncExpenseTypes();
      types = await this.expenseTypesRepository.listAll();
    }
    return types;
  }

  async syncDeputyExpenses(deputyId: number, ano: number, mes: number) {
    const deputy = await this.deputiesRepository.findById(deputyId);
    if (!deputy) {
      throw new AppError("Deputado nao encontrado", 404, "DEPUTY_NOT_FOUND");
    }

    await this.syncExpenseTypes();
    const expenseTypes = await this.expenseTypesRepository.listAll();
    const expenseTypeMap = new Map<string, string>(
      expenseTypes.map((item) => [normalize(item.label), item.id])
    );

    let page = 1;
    const items = 100;
    let imported = 0;

    while (true) {
      const response = await this.camaraClient.listDeputyExpenses(deputyId, ano, mes, page, items);
      if (!response.dados.length) {
        break;
      }

      for (const expense of response.dados) {
        let expenseTypeId: string | undefined;
        if (expense.tipoDespesa) {
          expenseTypeId = expenseTypeMap.get(normalize(expense.tipoDespesa));
        }

        await this.despesasRepository.upsertExpense({
          deputyId,
          expenseTypeId,
          ano: expense.ano,
          mes: expense.mes,
          dataDocumento: expense.dataDocumento ? new Date(expense.dataDocumento) : undefined,
          tipoDocumento: expense.tipoDocumento,
          numeroDocumento: expense.numDocumento,
          fornecedor: expense.nomeFornecedor,
          cnpjCpf: expense.cnpjCpfFornecedor,
          valorDocumento: toDecimal(expense.valorDocumento),
          valorGlosa: toDecimal(expense.valorGlosa),
          valorLiquido: toDecimal(expense.valorLiquido),
          urlDocumento: expense.urlDocumento,
          expenseHash: this.buildExpenseHash({
            deputyId,
            ano: expense.ano,
            mes: expense.mes,
            numeroDocumento: expense.numDocumento,
            dataDocumento: expense.dataDocumento,
            valorDocumento: expense.valorDocumento,
            fornecedor: expense.nomeFornecedor
          })
        });
        imported += 1;
      }

      if (response.dados.length < items) {
        break;
      }
      page += 1;
    }

    await deleteByPattern(`cache:ranking:ceap:${ano}:${mes}:*`);
    await deleteByPattern("cache:deputados:mes:*");
    await deleteByPattern("cache:deputados:resumo:*");
    await deleteByPattern(`cache:deputados:totais-mes:${ano}:${mes}:*`);
    await deleteByPattern("cache:dashboard:resumo:*");

    const [totalMes, [totalCount]] = await Promise.all([
      this.deputiesRepository.getMonthlyTotalByDeputy(deputyId, ano, mes),
      this.despesasRepository.listByDeputyAndPeriod(deputyId, ano, mes, 1, 1),
    ]);
    await this.deputiesRepository.upsertMonthTotals([
      {
        deputyId,
        ano,
        mes,
        totalCents: BigInt(Math.round(Number(totalMes || 0) * 100)),
        expensesCount: Number(totalCount || 0),
        lastSyncedAt: new Date(),
        sourceVersion: `${ano}-${mes}-${Date.now()}`,
      },
    ]);
    return { deputyId, ano, mes, imported };
  }

  async listDeputyExpenses(deputyId: number, ano: number, mes: number, page: number, items: number) {
    const deputy = await this.deputiesRepository.findById(deputyId);
    if (!deputy) {
      throw new AppError("Deputado nao encontrado", 404, "DEPUTY_NOT_FOUND");
    }

    let [total, expenses] = await this.despesasRepository.listByDeputyAndPeriod(deputyId, ano, mes, page, items);

    if (total === 0) {
      await this.syncDeputyExpenses(deputyId, ano, mes);
      [total, expenses] = await this.despesasRepository.listByDeputyAndPeriod(deputyId, ano, mes, page, items);
    }

    return {
      data: expenses,
      meta: {
        total,
        pagina: page,
        itens: items,
        totalPaginas: Math.ceil(total / items)
      }
    };
  }

  async listMonthExpenses(input: { ano?: number; mes?: number; pagina: number; itens: number }) {
    const ref = resolveBrazilMonthYear();
    const ano = input.ano ?? ref.ano;
    const mes = input.mes ?? ref.mes;

    const [{ total, rows }, categories] = await Promise.all([
      this.despesasRepository.listByMonth(ano, mes, input.pagina, input.itens),
      getExpenseCategoriesByMonth(ano, mes),
    ]);

    const monthTotal = categories.reduce((acc, item) => acc + Number(item.total || 0), 0);

    return {
      data: rows.map((row) => ({
        id: row.id,
        deputyId: row.deputyId,
        deputyName: row.deputyName,
        siglaPartido: row.siglaPartido,
        siglaUf: row.siglaUf,
        dataDocumento: row.dataDocumento?.toISOString() ?? null,
        numeroDocumento: row.numeroDocumento,
        fornecedor: row.fornecedor,
        valorLiquido: Number(row.valorLiquido ?? 0),
        urlDocumento: row.urlDocumento,
        categoryLabel: row.categoryLabel,
      })),
      meta: {
        ano,
        mes,
        pagina: input.pagina,
        itens: input.itens,
        total,
        totalPaginas: Math.ceil(total / input.itens),
        categories,
        monthTotal,
      },
    };
  }
}
