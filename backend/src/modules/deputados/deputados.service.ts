import { env } from "../../config/env";
import { CamaraClient } from "../../infra/http/camara-client";
import { redis } from "../../infra/redis/client";
import { deleteByPattern } from "../../infra/redis/cache-utils";
import { AppError } from "../../shared/errors/app-error";
import { DespesasService } from "../despesas/despesas.service";
import { DeputadosRepository } from "./deputados.repository";
import { SalarioService } from "./salario.service";

const SIX_HOURS_SECONDS = 60 * 60 * 6;
const AGGREGATE_CACHE_TTL_SECONDS = env.AGGREGATES_CACHE_TTL_SECONDS;
const MONTH_SYNC_STALE_MS = 15 * 60 * 1000;
const SYNC_CONCURRENCY = 4;

type ListInput = {
  pagina: number;
  itens: number;
  all?: boolean;
  ano?: number;
  mesNumero?: number;
  mes?: string;
  uf?: string;
  partido?: string;
  search?: string;
};

type DeputyFilters = {
  uf?: string;
  partido?: string;
  search?: string;
};

export class DeputadosService {
  private readonly repository = new DeputadosRepository();
  private readonly camaraClient = new CamaraClient();
  private readonly salarioService = new SalarioService();
  private readonly despesasService = new DespesasService();
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly syncJobs = new Map<string, Promise<unknown>>();

  private async readCache<T>(cacheKey: string): Promise<T | null> {
    try {
      const cached = await redis.get(cacheKey);
      if (!cached) return null;
      return JSON.parse(cached) as T;
    } catch (error) {
      console.warn("[deputados] cache read failed, continuing without cache", {
        cacheKey,
        message: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  private async writeCache(cacheKey: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(cacheKey, JSON.stringify(value), "EX", ttlSeconds);
    } catch (error) {
      console.warn("[deputados] cache write failed, continuing without cache", {
        cacheKey,
        ttlSeconds,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private parseMonthRef(monthRef: string) {
    const [yearRaw, monthRaw] = monthRef.split("-");
    const ano = Number(yearRaw);
    const mes = Number(monthRaw);
    if (!Number.isFinite(ano) || !Number.isFinite(mes) || mes < 1 || mes > 12) {
      throw new AppError("Mes invalido. Use o formato YYYY-MM", 400, "INVALID_MONTH");
    }
    return { ano, mes };
  }

  private async withInflightDedup<T>(key: string, producer: () => Promise<T>) {
    const current = this.inFlight.get(key) as Promise<T> | undefined;
    if (current) {
      return current;
    }

    const next = producer().finally(() => {
      this.inFlight.delete(key);
    });
    this.inFlight.set(key, next as Promise<unknown>);
    return next;
  }

  private async runWithConcurrency<T>(
    items: T[],
    limit: number,
    worker: (item: T, index: number) => Promise<void>,
  ) {
    const queue = [...items];
    let index = 0;

    const runners = Array.from({ length: Math.max(1, limit) }, async () => {
      while (queue.length > 0) {
        const current = queue.shift();
        if (current === undefined) return;
        const currentIndex = index;
        index += 1;
        await worker(current, currentIndex);
      }
    });

    await Promise.all(runners);
  }

  async syncAllDeputies() {
    let page = 1;
    const items = 100;
    let imported = 0;

    while (true) {
      const response = await this.camaraClient.listDeputies(page, items);
      if (!response.dados.length) break;

      await Promise.all(
        response.dados.map((deputy) =>
          this.repository.upsertDeputy({
            id: deputy.id,
            nome: deputy.nome,
            siglaUf: deputy.siglaUf,
            siglaPartido: deputy.siglaPartido,
            urlFoto: deputy.urlFoto,
            uri: deputy.uri,
            email: deputy.email
          })
        )
      );

      imported += response.dados.length;
      if (response.dados.length < items) break;
      page += 1;
    }

    await deleteByPattern("cache:deputados:list:*");
    await deleteByPattern("cache:deputados:detail:*");
    await deleteByPattern("cache:deputados:totais-mes:*");
    await deleteByPattern("cache:deputados:mes:*");
    await deleteByPattern("cache:deputados:resumo:*");
    return { imported };
  }

  async listDeputies(input: ListInput) {
    if (input.ano && input.mesNumero) {
      const monthRef = `${input.ano}-${String(input.mesNumero).padStart(2, "0")}`;
      return this.listDeputiesByMonth(monthRef, {
        uf: input.uf,
        partido: input.partido,
        search: input.search,
      });
    }

    if (input.mes) {
      return this.listDeputiesByMonth(input.mes, {
        uf: input.uf,
        partido: input.partido,
        search: input.search,
      });
    }

    const cacheKey = `cache:deputados:list:${JSON.stringify(input)}`;
    const cached = await this.readCache<{ data: unknown[]; meta: unknown }>(cacheKey);
    if (cached) {
      return cached;
    }

    let { total, deputies } = input.all
      ? await this.repository.listAll(input)
      : await this.repository.list(input, input.pagina, input.itens);
    if (total === 0) {
      await this.syncAllDeputies();
      ({ total, deputies } = input.all
        ? await this.repository.listAll(input)
        : await this.repository.list(input, input.pagina, input.itens));
    }

    const salario = await this.salarioService.getCurrentSalary();
    const response = {
      data: deputies.map((item) => ({ ...item, salario })),
      meta: {
        total,
        pagina: input.all ? 1 : input.pagina,
        itens: input.all ? total : input.itens,
        totalPaginas: input.all ? 1 : Math.ceil(total / input.itens)
      }
    };

    await this.writeCache(cacheKey, response, SIX_HOURS_SECONDS);
    return response;
  }

  async listDeputiesByMonth(monthRef: string, filters?: DeputyFilters) {
    const { ano, mes } = this.parseMonthRef(monthRef);
    const cacheKey = `cache:deputados:mes:${monthRef}:${JSON.stringify(filters ?? {})}`;
    const cached = await this.readCache<{ data: unknown[]; meta: unknown }>(cacheKey);
    if (cached) {
      return cached;
    }

    return this.withInflightDedup(cacheKey, async () => {
      const salary = await this.salarioService.getCurrentSalary();
      let deputies = await this.repository.listDeputiesWithMonthTotal(ano, mes, filters);
      if (deputies.length === 0) {
        await this.syncAllDeputies();
        deputies = await this.repository.listDeputiesWithMonthTotal(ano, mes, filters);
      }
      const syncMeta = await this.repository.getMonthSyncMeta(ano, mes);
      const isStale = !syncMeta.lastSyncedAt
        || Date.now() - syncMeta.lastSyncedAt.getTime() > MONTH_SYNC_STALE_MS;
      const response = {
        data: deputies.map((item) => ({
          ...item,
          salario: salary,
        })),
        meta: {
          mes: monthRef,
          ano,
          mesNumero: mes,
          total: deputies.length,
          totalWithValue: deputies.filter((item) => Number(item.totalMes) > 0).length,
          totalPersistedRows: syncMeta.totalRows,
          lastSyncedAtMes: syncMeta.lastSyncedAt?.toISOString() ?? null,
          stale: isStale,
          generatedAt: new Date().toISOString(),
        },
      };
      await this.writeCache(cacheKey, response, AGGREGATE_CACHE_TTL_SECONDS);
      return response;
    });
  }

  async getResumoByMonth(monthRef: string) {
    const { ano, mes } = this.parseMonthRef(monthRef);
    const cacheKey = `cache:deputados:resumo:${monthRef}`;
    const cached = await this.readCache<{ data: unknown; meta: unknown }>(cacheKey);
    if (cached) {
      return cached;
    }

    return this.withInflightDedup(cacheKey, async () => {
      const [totalGeralMes, rowsByMonth, syncMeta] = await Promise.all([
        this.repository.getTotalByMonth(ano, mes),
        this.repository.getTotalsByMonthForYear(ano),
        this.repository.getMonthSyncMeta(ano, mes),
      ]);

      const totalsByMonth = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const row = rowsByMonth.find((entry) => entry.mes === month);
        return {
          mes: month,
          total: Number(row?.total ?? 0),
        };
      });

      const response = {
        data: {
          mes: monthRef,
          ano,
          mesNumero: mes,
          totalGeralMes,
          totalsByMonth,
        },
        meta: {
          lastSyncedAtMes: syncMeta.lastSyncedAt?.toISOString() ?? null,
          stale: !syncMeta.lastSyncedAt
            || Date.now() - syncMeta.lastSyncedAt.getTime() > MONTH_SYNC_STALE_MS,
          generatedAt: new Date().toISOString(),
        },
      };

      await this.writeCache(cacheKey, response, AGGREGATE_CACHE_TTL_SECONDS);
      return response;
    });
  }

  async getDeputyById(id: number) {
    const cacheKey = `cache:deputados:detail:${id}`;
    const cached = await this.readCache<Record<string, unknown>>(cacheKey);
    if (cached) {
      const parsed = cached as { salario?: number | null };
      if (Object.prototype.hasOwnProperty.call(parsed, "salario")) {
        return parsed;
      }
      const salario = await this.salarioService.getCurrentSalary();
      return { ...parsed, salario };
    }

    let deputy = await this.repository.findById(id);
    const stale = deputy ? Date.now() - deputy.updatedAt.getTime() > SIX_HOURS_SECONDS * 1000 : true;
    if (!deputy || stale) {
      const response = await this.camaraClient.getDeputyById(id);
      if (!response?.dados) {
        throw new AppError("Deputado nao encontrado", 404, "DEPUTY_NOT_FOUND");
      }
      deputy = await this.repository.upsertDeputy({
        id: response.dados.id,
        nome: response.dados.ultimoStatus?.nome ?? response.dados.nomeCivil ?? response.dados.nome ?? "",
        siglaUf: response.dados.ultimoStatus?.siglaUf ?? "",
        siglaPartido: response.dados.ultimoStatus?.siglaPartido ?? "",
        urlFoto: response.dados.ultimoStatus?.urlFoto ?? "",
        uri: response.dados.uri,
        email: response.dados.ultimoStatus?.email ?? undefined
      });
    }

    const salario = await this.salarioService.getCurrentSalary();
    const response = { ...deputy, salario };

    await this.writeCache(cacheKey, response, SIX_HOURS_SECONDS);
    return response;
  }

  async listMonthlyTotals(ano: number, mes: number, limit: number, offset: number, page: number) {
    const cacheKey = `cache:deputados:totais-mes:${ano}:${mes}:${limit}:${offset}`;
    const cached = await this.readCache<{ data: unknown[]; meta: unknown }>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.repository.listMonthlyTotals(ano, mes, limit, offset);
    const response = {
      data: result.rows,
      meta: {
        ano,
        mes,
        limit,
        offset,
        page,
        total: result.totalRows,
        hasMore: offset + result.rows.length < result.totalRows,
      }
    };

    await this.writeCache(cacheKey, response, 60 * 5);
    return response;
  }

  async getDeputyMonthlyResumo(id: number, ano: number, mes: number) {
    const deputy = await this.repository.findById(id);
    if (!deputy) {
      throw new AppError("Deputado nao encontrado", 404, "DEPUTY_NOT_FOUND");
    }

    const persisted = await this.repository.getMonthTotalRow(id, ano, mes);
    const totalMes = persisted ? Number(persisted.totalCents) / 100 : await this.repository.getMonthlyTotalByDeputy(id, ano, mes);
    return {
      deputadoId: id,
      ano,
      mes,
      totalMes,
      lastSyncedAt: persisted?.lastSyncedAt?.toISOString() ?? null,
    };
  }

  async getDeputyYearResumo(id: number, ano: number) {
    const deputy = await this.repository.findById(id);
    if (!deputy) {
      throw new AppError("Deputado nao encontrado", 404, "DEPUTY_NOT_FOUND");
    }

    const rows = await this.repository.getMonthlyTotalsByDeputyYear(id, ano);
    const totalsByMonth = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const row = rows.find((entry) => entry.mes === month);
      return {
        mes: month,
        totalMes: Number(row?.totalMes ?? 0),
      };
    });

    return {
      deputadoId: id,
      ano,
      totalsByMonth,
    };
  }

  async syncMonthTotalsAll(ano: number, mes: number, force = false) {
    const jobKey = `${ano}-${mes}`;
    if (this.syncJobs.has(jobKey)) {
      return {
        ok: true,
        ano,
        mes,
        inProgress: true,
      };
    }

    const startedAt = Date.now();
    const job = (async () => {
      const deputyIds = await this.repository.listAllDeputyIds();
      if (!deputyIds.length) {
        await this.syncAllDeputies();
      }

      const finalDeputyIds = deputyIds.length ? deputyIds : await this.repository.listAllDeputyIds();
      const monthSyncMeta = await this.repository.getMonthSyncMeta(ano, mes);
      const firstAggregates = await this.repository.getExpenseAggregatesByMonth(ano, mes);
      const aggregateMap = new Map<number, { totalCents: bigint; expensesCount: number }>(
        firstAggregates.map((item) => [item.deputyId, { totalCents: item.totalCents, expensesCount: item.expensesCount }]),
      );

      const missingIds = finalDeputyIds.filter((id) => !aggregateMap.has(id));
      const isStale = !monthSyncMeta.lastSyncedAt
        || Date.now() - monthSyncMeta.lastSyncedAt.getTime() > MONTH_SYNC_STALE_MS;
      const shouldResyncAll = force || isStale;
      const idsToSync = shouldResyncAll ? finalDeputyIds : missingIds;

      if (idsToSync.length > 0) {
        await this.runWithConcurrency(idsToSync, SYNC_CONCURRENCY, async (deputyId) => {
          try {
            await this.despesasService.syncDeputyExpenses(deputyId, ano, mes);
          } catch {
            // keep partial sync resilient for full-month job
          }
        });
      }

      const finalAggregates = await this.repository.getExpenseAggregatesByMonth(ano, mes);
      const finalMap = new Map<number, { totalCents: bigint; expensesCount: number }>(
        finalAggregates.map((item) => [item.deputyId, { totalCents: item.totalCents, expensesCount: item.expensesCount }]),
      );

      const now = new Date();
      const rows = finalDeputyIds.map((deputyId) => {
        const entry = finalMap.get(deputyId);
        return {
          deputyId,
          ano,
          mes,
          totalCents: entry?.totalCents ?? BigInt(0),
          expensesCount: entry?.expensesCount ?? 0,
          lastSyncedAt: now,
          sourceVersion: `${ano}-${mes}-${now.getTime()}`,
        };
      });

      await this.repository.upsertMonthTotals(rows);

      await deleteByPattern(`cache:deputados:mes:${ano}-${String(mes).padStart(2, "0")}:*`);
      await deleteByPattern(`cache:deputados:resumo:${ano}-${String(mes).padStart(2, "0")}`);
      await deleteByPattern("cache:deputados:totais-mes:*");
      await deleteByPattern("cache:ranking:ceap:*");
      await deleteByPattern("cache:dashboard:resumo:*");

      return {
        ok: true,
        ano,
        mes,
        inProgress: false,
        deputadosAtualizados: rows.length,
        durationMs: Date.now() - startedAt,
      };
    })();

    this.syncJobs.set(jobKey, job);
    try {
      return await job;
    } finally {
      this.syncJobs.delete(jobKey);
    }
  }
}
