import AsyncStorage from '@react-native-async-storage/async-storage';
import { listDeputadosRequest } from './endpoints';
import { deputyExpensesRequest, getDeputadoMonthlyTotalRequest, listAnalyticsDeputadosTotalsMesRequest } from './endpoints';
import { promisePool } from '../utils/promisePool';
import { mapExpense } from './mappers';
import { toNumberBR } from '../utils/money';
import { getCacheValue, setCacheValue } from '../cache/cacheManager';
import { CACHE_KEYS } from '../cache/cacheKeys';

const MAX_LIST_LIMIT = 100;
const EXPENSES_PAGE_SIZE = 100;
const EXPENSES_MAX_PAGES = 20;
const MONTHLY_TOTALS_CACHE_PREFIX = 'totals:';
const YEAR_TOTALS_CACHE_PREFIX = 'aggregatedTotals:';
const LAST_SYNC_AT_KEY = 'lastSyncAt';
const DEFAULT_CONCURRENCY = 6;
const TOTALS_CACHE_TTL_MS = 5 * 60 * 1000;
const ENDPOINT_RECHECK_WINDOW_MS = 10 * 60 * 1000;

type EndpointAvailability = 'unknown' | 'available' | 'unavailable';

const endpointAvailability: Record<'analyticsTotalsMes' | 'deputadoResumo', { status: EndpointAvailability; checkedAt: number }> = {
  analyticsTotalsMes: { status: 'unknown', checkedAt: 0 },
  deputadoResumo: { status: 'unknown', checkedAt: 0 },
};

interface MonthlyDeputyTotalsCache {
  year: number;
  month: number;
  totalsByDeputyId: Record<string, number>;
  updatedAt: string;
}

interface YearTotalsCache {
  year: number;
  totals: number[];
  updatedAt: string;
}

export interface MonthlyTotalsProgress {
  processed: number;
  total: number;
  deputyId?: number;
}

export interface MonthlyTotalsResult {
  year: number;
  month: number;
  totalsByDeputyId: Record<string, number>;
  total: number;
  updatedAt: string;
  source: 'cache' | 'network';
  failedDeputyIds: number[];
  totalDeputies: number;
}

export interface YearTotalsResult {
  year: number;
  totals: number[];
  updatedAt: string;
  source: 'cache' | 'network';
}

function monthCacheKey(year: number, month: number) {
  return `${MONTHLY_TOTALS_CACHE_PREFIX}${year}:${month}`;
}

function yearCacheKey(year: number) {
  return `${YEAR_TOTALS_CACHE_PREFIX}${year}`;
}

function emptyYearTotals() {
  return Array.from({ length: 12 }, () => 0);
}

function clampConcurrency(value?: number) {
  const parsed = Number(value ?? DEFAULT_CONCURRENCY);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_CONCURRENCY;
  }
  return Math.min(Math.max(Math.trunc(parsed), 1), 8);
}

function normalizeTotalsMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  return Object.entries(raw as Record<string, unknown>).reduce<Record<string, number>>((acc, [key, value]) => {
    acc[String(key)] = toNumberBR(value);
    return acc;
  }, {});
}

function sumTotalsMap(totalsByDeputyId: Record<string, number>) {
  return Object.values(totalsByDeputyId).reduce((acc, value) => acc + toNumberBR(value), 0);
}

function shouldSkipEndpointProbe(key: keyof typeof endpointAvailability) {
  const state = endpointAvailability[key];
  if (state.status !== 'unavailable') {
    return false;
  }
  return Date.now() - state.checkedAt < ENDPOINT_RECHECK_WINDOW_MS;
}

function markEndpointAvailability(
  key: keyof typeof endpointAvailability,
  status: EndpointAvailability,
) {
  endpointAvailability[key] = {
    status,
    checkedAt: Date.now(),
  };
}

function isNotFoundError(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 404;
}

async function readMonthCache(year: number, month: number): Promise<MonthlyDeputyTotalsCache | null> {
  const nextCache = await getCacheValue<MonthlyDeputyTotalsCache>(CACHE_KEYS.monthlyTotals(year, month));
  if (nextCache?.value?.year === year && nextCache.value.month === month) {
    return {
      year,
      month,
      totalsByDeputyId: normalizeTotalsMap(nextCache.value.totalsByDeputyId),
      updatedAt: typeof nextCache.value.updatedAt === 'string' ? nextCache.value.updatedAt : new Date(0).toISOString(),
    };
  }

  const legacyRaw = await AsyncStorage.getItem(monthCacheKey(year, month));
  if (!legacyRaw) {
    return null;
  }
  try {
    const parsed = JSON.parse(legacyRaw) as Partial<MonthlyDeputyTotalsCache>;
    if (!parsed || parsed.year !== year || parsed.month !== month) {
      return null;
    }
    return {
      year,
      month,
      totalsByDeputyId: normalizeTotalsMap(parsed.totalsByDeputyId),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

async function writeMonthCache(year: number, month: number, totalsByDeputyId: Record<string, number>) {
  const payload: MonthlyDeputyTotalsCache = {
    year,
    month,
    totalsByDeputyId,
    updatedAt: new Date().toISOString(),
  };
  await setCacheValue(CACHE_KEYS.monthlyTotals(year, month), payload, TOTALS_CACHE_TTL_MS);
  await AsyncStorage.setItem(monthCacheKey(year, month), JSON.stringify(payload));
}

async function readYearCache(year: number): Promise<YearTotalsCache | null> {
  const nextCache = await getCacheValue<YearTotalsCache>(CACHE_KEYS.yearChart(year));
  if (nextCache?.value?.year === year) {
    const totals = Array.isArray(nextCache.value.totals)
      ? nextCache.value.totals.slice(0, 12).map((value) => toNumberBR(value))
      : emptyYearTotals();
    while (totals.length < 12) {
      totals.push(0);
    }
    return {
      year,
      totals,
      updatedAt: typeof nextCache.value.updatedAt === 'string' ? nextCache.value.updatedAt : new Date(0).toISOString(),
    };
  }

  const legacyRaw = await AsyncStorage.getItem(yearCacheKey(year));
  if (!legacyRaw) {
    return null;
  }
  try {
    const parsed = JSON.parse(legacyRaw) as Partial<YearTotalsCache>;
    if (!parsed || parsed.year !== year) {
      return null;
    }
    const totals = Array.isArray(parsed.totals)
      ? parsed.totals.slice(0, 12).map((value) => toNumberBR(value))
      : emptyYearTotals();
    while (totals.length < 12) {
      totals.push(0);
    }
    return {
      year,
      totals,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

async function writeYearCache(year: number, totals: number[]) {
  const normalized = emptyYearTotals();
  totals.slice(0, 12).forEach((value, index) => {
    normalized[index] = toNumberBR(value);
  });
  const payload: YearTotalsCache = {
    year,
    totals: normalized,
    updatedAt: new Date().toISOString(),
  };
  await setCacheValue(CACHE_KEYS.yearChart(year), payload, TOTALS_CACHE_TTL_MS);
  await AsyncStorage.setItem(yearCacheKey(year), JSON.stringify(payload));
}

async function fetchAllDeputyIds(): Promise<number[]> {
  const ids: number[] = [];
  let page = 1;

  while (page <= 100) {
    const response = await listDeputadosRequest({ pagina: page, itens: MAX_LIST_LIMIT });
    const rows = response.data ?? [];

    rows.forEach((item) => {
      const id = Number((item as any)?.id);
      if (Number.isFinite(id)) {
        ids.push(id);
      }
    });

    if (rows.length < MAX_LIST_LIMIT) {
      break;
    }

    page += 1;
  }

  return ids;
}

async function retry<T>(fn: () => Promise<T>, retries = 2, delayMs = 250): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
      attempt += 1;
    }
  }

  throw lastError;
}

async function tryFetchAnalyticsTotalsByMonth(year: number, month: number) {
  if (shouldSkipEndpointProbe('analyticsTotalsMes')) {
    return {};
  }

  const totalsByDeputyId: Record<string, number> = {};
  let offset = 0;

  while (offset <= 20000) {
    let rows: Awaited<ReturnType<typeof listAnalyticsDeputadosTotalsMesRequest>> = [];
    try {
      rows = await listAnalyticsDeputadosTotalsMesRequest({
        ano: year,
        mes: month,
        limit: MAX_LIST_LIMIT,
        offset,
      });
      markEndpointAvailability('analyticsTotalsMes', 'available');
    } catch (error) {
      if (isNotFoundError(error)) {
        markEndpointAvailability('analyticsTotalsMes', 'unavailable');
        return {};
      }
      throw error;
    }

    if (!rows.length) {
      break;
    }

    rows.forEach((row) => {
      const deputyId = Number(row.deputadoId ?? row.deputyId ?? row.id);
      if (!Number.isFinite(deputyId)) {
        return;
      }
      totalsByDeputyId[String(deputyId)] = toNumberBR(row.totalMes ?? row.total ?? 0);
    });

    if (rows.length < MAX_LIST_LIMIT) {
      break;
    }

    offset += MAX_LIST_LIMIT;
  }

  return totalsByDeputyId;
}

export async function getDeputadoMonthlyTotal(deputadoId: number, ano: number, mes: number) {
  if (!shouldSkipEndpointProbe('deputadoResumo')) {
    try {
      const total = await retry(() => getDeputadoMonthlyTotalRequest(deputadoId, { ano, mes }), 2, 250);
      markEndpointAvailability('deputadoResumo', 'available');
      return toNumberBR(total);
    } catch (error) {
      if (isNotFoundError(error)) {
        markEndpointAvailability('deputadoResumo', 'unavailable');
      }
    }
  }

  try {
    let total = 0;
    let page = 1;

    while (page <= EXPENSES_MAX_PAGES) {
      const rows = await deputyExpensesRequest(deputadoId, {
        ano,
        mes,
        pagina: page,
        itens: EXPENSES_PAGE_SIZE,
      });
      total += rows
        .map((row) => mapExpense(row).valor)
        .reduce((acc, value) => acc + toNumberBR(value), 0);

      if (rows.length < EXPENSES_PAGE_SIZE) {
        break;
      }
      page += 1;
    }

    return total;
  } catch {
    return 0;
  }
}

export async function getAllDeputadosMonthlyTotals(
  ano: number,
  mes: number,
  options?: {
    forceRefresh?: boolean;
    concurrency?: number;
    allowPerDeputyFallback?: boolean;
    deputyIdsOverride?: number[];
    onProgress?: (progress: MonthlyTotalsProgress) => void;
    onPartial?: (deputyId: number, total: number, progress: MonthlyTotalsProgress) => void;
    shouldCancel?: () => boolean;
  },
): Promise<MonthlyTotalsResult> {
  const cached = await readMonthCache(ano, mes);
  if (cached && !options?.forceRefresh) {
    return {
      year: ano,
      month: mes,
      totalsByDeputyId: cached.totalsByDeputyId,
      total: sumTotalsMap(cached.totalsByDeputyId),
      updatedAt: cached.updatedAt,
      source: 'cache',
      failedDeputyIds: [],
      totalDeputies: Object.keys(cached.totalsByDeputyId).length,
    };
  }

  const deputyIds = options?.deputyIdsOverride ?? (await fetchAllDeputyIds());
  const totalsByDeputyId: Record<string, number> = {};
  const failedDeputyIds: number[] = [];

  try {
    const analyticsTotals = await tryFetchAnalyticsTotalsByMonth(ano, mes);
    Object.assign(totalsByDeputyId, analyticsTotals);
  } catch (error) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[aggregations] analytics endpoint unavailable, fallback per deputy', {
        ano,
        mes,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const missingDeputyIds = deputyIds.filter((id) => totalsByDeputyId[String(id)] === undefined);
  const shouldRunPerDeputyFallback = options?.allowPerDeputyFallback !== false;
  let processed = Object.keys(totalsByDeputyId).length;

  if (shouldRunPerDeputyFallback && missingDeputyIds.length > 0) {
    await promisePool(missingDeputyIds, clampConcurrency(options?.concurrency), async (deputyId) => {
      if (options?.shouldCancel?.()) {
        return;
      }

      try {
        const total = await getDeputadoMonthlyTotal(deputyId, ano, mes);
        totalsByDeputyId[String(deputyId)] = total;
        processed += 1;

        const progress: MonthlyTotalsProgress = {
          processed,
          total: deputyIds.length,
          deputyId,
        };

        options?.onPartial?.(deputyId, total, progress);
        options?.onProgress?.(progress);
      } catch {
        failedDeputyIds.push(deputyId);
        processed += 1;
        options?.onProgress?.({
          processed,
          total: deputyIds.length,
          deputyId,
        });
      }
    });
  } else if (missingDeputyIds.length > 0) {
    failedDeputyIds.push(...missingDeputyIds);
  }

  if (options?.shouldCancel?.()) {
    throw new Error('cancelled');
  }

  await writeMonthCache(ano, mes, totalsByDeputyId);
  await AsyncStorage.setItem(LAST_SYNC_AT_KEY, new Date().toISOString());

  return {
    year: ano,
    month: mes,
    totalsByDeputyId,
    total: sumTotalsMap(totalsByDeputyId),
    updatedAt: new Date().toISOString(),
    source: 'network',
    failedDeputyIds,
    totalDeputies: deputyIds.length,
  };
}

export async function getTotalsByYear(
  ano: number,
  options?: {
    forceRefresh?: boolean;
    concurrency?: number;
    deputyIdsOverride?: number[];
    networkOnMiss?: boolean;
    shouldCancel?: () => boolean;
    onMonthDone?: (month: number, total: number) => void;
    onProgress?: (month: number, progress: MonthlyTotalsProgress) => void;
  },
): Promise<YearTotalsResult> {
  const cached = await readYearCache(ano);
  if (cached && !options?.forceRefresh) {
    return {
      year: ano,
      totals: cached.totals,
      updatedAt: cached.updatedAt,
      source: 'cache',
    };
  }

  if (!cached && !options?.forceRefresh && options?.networkOnMiss === false) {
    return {
      year: ano,
      totals: emptyYearTotals(),
      updatedAt: new Date(0).toISOString(),
      source: 'cache',
    };
  }

  const deputyIds = options?.deputyIdsOverride ?? (await fetchAllDeputyIds());
  const totals = emptyYearTotals();

  await promisePool(Array.from({ length: 12 }, (_, index) => index + 1), 2, async (month) => {
    if (options?.shouldCancel?.()) {
      throw new Error('cancelled');
    }

    const monthly = await getAllDeputadosMonthlyTotals(ano, month, {
      forceRefresh: Boolean(options?.forceRefresh),
      deputyIdsOverride: deputyIds,
      concurrency: options?.concurrency,
      shouldCancel: options?.shouldCancel,
      onProgress: (progress) => options?.onProgress?.(month, progress),
    });

    totals[month - 1] = monthly.total;
    options?.onMonthDone?.(month, monthly.total);
  });

  if (options?.shouldCancel?.()) {
    throw new Error('cancelled');
  }

  await writeYearCache(ano, totals);
  await AsyncStorage.setItem(LAST_SYNC_AT_KEY, new Date().toISOString());

  return {
    year: ano,
    totals,
    updatedAt: new Date().toISOString(),
    source: 'network',
  };
}

export async function getLastSyncAt() {
  return AsyncStorage.getItem(LAST_SYNC_AT_KEY);
}
