import crypto from "node:crypto";
import { Prisma } from "@prisma/client";
import { CamaraClient } from "../../infra/http/camara-client";
import { deleteByPattern } from "../../infra/redis/cache-utils";
import { AppError } from "../../shared/errors/app-error";
import { DeputadosRepository } from "../deputados/deputados.repository";
import { DespesasRepository } from "./despesas.repository";
import { ExpenseTypesRepository } from "./expense-types.repository";

function toDecimal(value: number | undefined): Prisma.Decimal {
  return new Prisma.Decimal(value ?? 0);
}

function normalize(value?: string): string {
  return (value ?? "").trim().toLowerCase();
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
}
