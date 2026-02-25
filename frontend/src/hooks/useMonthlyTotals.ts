import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { getAllDeputadosMonthlyTotals, getTotalsByYear, MonthlyTotalsProgress } from '../services/aggregations';
import { getApiRequestErrorDetails, getRateLimitSnapshot } from '../services/api';
import { normalizeMonthlySeries } from '../utils/series';

interface MonthlyTotalsState {
  totalsById: Record<string, number>;
  loadedById: Record<string, true>;
  failedIds: number[];
  monthTotal: number;
  monthLoading: boolean;
  yearTotals: number[];
  yearLoading: boolean;
  progress: string | null;
}

type Action =
  | { type: 'MONTH_LOADING'; value: boolean }
  | { type: 'YEAR_LOADING'; value: boolean }
  | { type: 'SET_PROGRESS'; value: string | null }
  | {
      type: 'APPLY_MONTH_FULL';
      totalsById: Record<string, number>;
      failedIds: number[];
      monthTotal: number;
    }
  | {
      type: 'APPLY_MONTH_PARTIAL';
      partialTotalsById: Record<string, number>;
      loadedIds: number[];
    }
  | { type: 'SET_YEAR_TOTALS'; yearTotals: number[] }
  | { type: 'SET_YEAR_MONTH_TOTAL'; month: number; total: number };

const initialState: MonthlyTotalsState = {
  totalsById: {},
  loadedById: {},
  failedIds: [],
  monthTotal: 0,
  monthLoading: false,
  yearTotals: Array.from({ length: 12 }, () => 0),
  yearLoading: false,
  progress: null,
};

function sumTotals(totalsById: Record<string, number>) {
  return Object.values(totalsById).reduce((acc, value) => acc + Number(value || 0), 0);
}

function reducer(state: MonthlyTotalsState, action: Action): MonthlyTotalsState {
  switch (action.type) {
    case 'MONTH_LOADING':
      return {
        ...state,
        monthLoading: action.value,
      };
    case 'YEAR_LOADING':
      return {
        ...state,
        yearLoading: action.value,
      };
    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.value,
      };
    case 'APPLY_MONTH_FULL': {
      const loadedById = Object.keys(action.totalsById).reduce<Record<string, true>>((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      return {
        ...state,
        totalsById: action.totalsById,
        loadedById,
        failedIds: action.failedIds,
        monthTotal: action.monthTotal,
      };
    }
    case 'APPLY_MONTH_PARTIAL': {
      if (!Object.keys(action.partialTotalsById).length && !action.loadedIds.length) {
        return state;
      }

      const totalsById = {
        ...state.totalsById,
        ...action.partialTotalsById,
      };
      const loadedById = { ...state.loadedById };
      action.loadedIds.forEach((id) => {
        loadedById[String(id)] = true;
      });

      return {
        ...state,
        totalsById,
        loadedById,
        monthTotal: sumTotals(totalsById),
      };
    }
    case 'SET_YEAR_TOTALS':
      return {
        ...state,
        yearTotals: action.yearTotals.length === 12 ? action.yearTotals : Array.from({ length: 12 }, (_, i) => action.yearTotals[i] ?? 0),
      };
    case 'SET_YEAR_MONTH_TOTAL': {
      const next = state.yearTotals.length === 12 ? [...state.yearTotals] : Array.from({ length: 12 }, () => 0);
      next[Math.max(0, Math.min(11, action.month - 1))] = action.total;
      return {
        ...state,
        yearTotals: next,
      };
    }
    default:
      return state;
  }
}

function buildProgress(prefix: string, progress: MonthlyTotalsProgress, month?: number) {
  const monthSuffix = month ? ` (mês ${month})` : '';
  return `${prefix} ${progress.processed}/${progress.total}${monthSuffix}`;
}

function shouldEmitProgress(progress: MonthlyTotalsProgress, step: number) {
  return progress.processed === progress.total || progress.processed % step === 0;
}

export function useMonthlyTotals(ano: number, mes: number) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const monthRequestIdRef = useRef(0);
  const yearRequestIdRef = useRef(0);
  const partialTotalsRef = useRef<Record<string, number>>({});
  const partialLoadedRef = useRef<number[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renderCountRef = useRef(0);

  if (__DEV__) {
    renderCountRef.current += 1;
    if (renderCountRef.current <= 20 && renderCountRef.current % 5 === 0) {
      // eslint-disable-next-line no-console
      console.log(`[perf] useMonthlyTotals renders=${renderCountRef.current} ano=${ano} mes=${mes}`);
    }
  }

  const flushPartial = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    const partial = partialTotalsRef.current;
    const loaded = partialLoadedRef.current;
    partialTotalsRef.current = {};
    partialLoadedRef.current = [];

    dispatch({
      type: 'APPLY_MONTH_PARTIAL',
      partialTotalsById: partial,
      loadedIds: loaded,
    });
  }, []);

  const queuePartial = useCallback((deputyId: number, total: number) => {
    partialTotalsRef.current[String(deputyId)] = total;
    partialLoadedRef.current.push(deputyId);

    if (flushTimerRef.current) {
      return;
    }
    flushTimerRef.current = setTimeout(() => {
      flushPartial();
    }, 120);
  }, [flushPartial]);

  const syncMonth = useCallback(async (forceRefresh: boolean, deputyIdsOverride?: number[]) => {
    const rateSnapshot = getRateLimitSnapshot();
    if (rateSnapshot.isLimited && forceRefresh) {
      const seconds = Math.max(1, Math.ceil(rateSnapshot.remainingMs / 1000));
      dispatch({ type: 'SET_PROGRESS', value: `Servidor ocupado. Tentando novamente em ${seconds}s.` });
      return;
    }

    const requestId = monthRequestIdRef.current + 1;
    monthRequestIdRef.current = requestId;
    dispatch({ type: 'MONTH_LOADING', value: true });

    try {
      const cacheFirst = await getAllDeputadosMonthlyTotals(ano, mes, {
        forceRefresh: false,
        deputyIdsOverride,
      });
      if (monthRequestIdRef.current !== requestId) {
        return;
      }

      dispatch({
        type: 'APPLY_MONTH_FULL',
        totalsById: cacheFirst.totalsByDeputyId,
        failedIds: cacheFirst.failedDeputyIds,
        monthTotal: cacheFirst.total,
      });
      dispatch({ type: 'SET_YEAR_MONTH_TOTAL', month: mes, total: cacheFirst.total });

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[perf] syncMonth start ano=${ano} mes=${mes} reason=${forceRefresh ? 'force' : 'revalidate'}`);
      }

      const shouldRevalidate = forceRefresh;
      if (!shouldRevalidate) {
        dispatch({ type: 'SET_PROGRESS', value: null });
        return;
      }

      const network = await getAllDeputadosMonthlyTotals(ano, mes, {
        forceRefresh: true,
        deputyIdsOverride,
        shouldCancel: () => monthRequestIdRef.current !== requestId,
        onPartial: (deputyId, total, progress) => {
          if (monthRequestIdRef.current !== requestId) return;
          queuePartial(deputyId, total);
          if (shouldEmitProgress(progress, 10)) {
            dispatch({ type: 'SET_PROGRESS', value: buildProgress('Atualizando valores', progress) });
          }
        },
        onProgress: (progress) => {
          if (monthRequestIdRef.current !== requestId) return;
          if (shouldEmitProgress(progress, 10)) {
            dispatch({ type: 'SET_PROGRESS', value: buildProgress('Atualizando valores', progress) });
          }
        },
      });

      if (monthRequestIdRef.current !== requestId) {
        return;
      }
      flushPartial();

      dispatch({
        type: 'APPLY_MONTH_FULL',
        totalsById: network.totalsByDeputyId,
        failedIds: network.failedDeputyIds,
        monthTotal: network.total,
      });
      dispatch({ type: 'SET_YEAR_MONTH_TOTAL', month: mes, total: network.total });

      // Automatic retry for remaining failures.
      if (network.failedDeputyIds.length > 0) {
        const retryResult = await getAllDeputadosMonthlyTotals(ano, mes, {
          forceRefresh: true,
          deputyIdsOverride: network.failedDeputyIds,
          shouldCancel: () => monthRequestIdRef.current !== requestId,
        });
        if (monthRequestIdRef.current === requestId) {
          dispatch({
            type: 'APPLY_MONTH_FULL',
            totalsById: {
              ...network.totalsByDeputyId,
              ...retryResult.totalsByDeputyId,
            },
            failedIds: retryResult.failedDeputyIds,
            monthTotal: sumTotals({
              ...network.totalsByDeputyId,
              ...retryResult.totalsByDeputyId,
            }),
          });
        }
      }

      dispatch({ type: 'SET_PROGRESS', value: null });
    } catch (error) {
      if (String((error as Error)?.message || '') !== 'cancelled') {
        const details = getApiRequestErrorDetails(error);
        if (details.status === 429) {
          const nextRateSnapshot = getRateLimitSnapshot();
          const seconds = Math.max(1, Math.ceil(nextRateSnapshot.remainingMs / 1000));
          dispatch({ type: 'SET_PROGRESS', value: `Servidor ocupado. Tentando novamente em ${seconds}s.` });
        } else {
          dispatch({ type: 'SET_PROGRESS', value: null });
        }
      }
    } finally {
      if (monthRequestIdRef.current === requestId) {
        dispatch({ type: 'MONTH_LOADING', value: false });
      }
    }
  }, [ano, flushPartial, mes, queuePartial]);

  const syncYear = useCallback(async (forceRefresh: boolean) => {
    const rateSnapshot = getRateLimitSnapshot();
    if (rateSnapshot.isLimited && forceRefresh) {
      const seconds = Math.max(1, Math.ceil(rateSnapshot.remainingMs / 1000));
      dispatch({ type: 'SET_PROGRESS', value: `Servidor ocupado. Tentando novamente em ${seconds}s.` });
      return;
    }

    const requestId = yearRequestIdRef.current + 1;
    yearRequestIdRef.current = requestId;
    dispatch({ type: 'YEAR_LOADING', value: true });

    try {
      const cacheFirst = await getTotalsByYear(ano, {
        forceRefresh: false,
        networkOnMiss: false,
      });
      if (yearRequestIdRef.current !== requestId) {
        return;
      }
      dispatch({ type: 'SET_YEAR_TOTALS', yearTotals: cacheFirst.totals });

      const shouldRevalidate = forceRefresh;
      if (!shouldRevalidate) {
        return;
      }

      const network = await getTotalsByYear(ano, {
        forceRefresh: true,
        shouldCancel: () => yearRequestIdRef.current !== requestId,
        onMonthDone: (month, total) => {
          if (yearRequestIdRef.current !== requestId) return;
          dispatch({ type: 'SET_YEAR_MONTH_TOTAL', month, total });
        },
        onProgress: (month, progress) => {
          if (yearRequestIdRef.current !== requestId) return;
          if (shouldEmitProgress(progress, 20)) {
            dispatch({ type: 'SET_PROGRESS', value: buildProgress('Atualizando grafico', progress, month) });
          }
        },
      });
      if (yearRequestIdRef.current !== requestId) {
        return;
      }
      dispatch({ type: 'SET_YEAR_TOTALS', yearTotals: network.totals });
      dispatch({ type: 'SET_PROGRESS', value: null });
    } catch (error) {
      if (String((error as Error)?.message || '') !== 'cancelled') {
        const details = getApiRequestErrorDetails(error);
        if (details.status === 429) {
          const nextRateSnapshot = getRateLimitSnapshot();
          const seconds = Math.max(1, Math.ceil(nextRateSnapshot.remainingMs / 1000));
          dispatch({ type: 'SET_PROGRESS', value: `Servidor ocupado. Tentando novamente em ${seconds}s.` });
        } else {
          dispatch({ type: 'SET_PROGRESS', value: null });
        }
      }
    } finally {
      if (yearRequestIdRef.current === requestId) {
        dispatch({ type: 'YEAR_LOADING', value: false });
      }
    }
  }, [ano]);

  useEffect(() => {
    syncMonth(false);
    return () => {
      monthRequestIdRef.current += 1;
    };
  }, [ano, mes, syncMonth]);

  useEffect(() => {
    syncYear(false);
    return () => {
      yearRequestIdRef.current += 1;
    };
  }, [ano, syncYear]);

  useEffect(() => {
    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    };
  }, []);

  const chartPoints = useMemo(() => {
    const rawSeries = state.yearTotals.map((value, index) => ({
      ano,
      mes: index + 1,
      total: value,
    }));
    return normalizeMonthlySeries(rawSeries, ano).map((point) => ({
      key: `month-${point.month}`,
      label: point.label,
      value: point.total,
    }));
  }, [ano, state.yearTotals]);

  const loadedIdsSet = useMemo(() => {
    return new Set<number>(
      Object.keys(state.loadedById)
        .map((id) => Number(id))
        .filter((value) => Number.isFinite(value)),
    );
  }, [state.loadedById]);

  const refreshAll = useCallback(async () => {
    // Explicit refresh keeps network load bounded to selected month totals.
    // Year chart uses cache + selected month patch updates.
    await syncMonth(true);
  }, [syncMonth]);

  const retryFailed = useCallback(async () => {
    if (!state.failedIds.length) {
      return;
    }
    await syncMonth(true, state.failedIds);
  }, [state.failedIds, syncMonth]);

  return {
    totalsById: state.totalsById,
    loadedIds: loadedIdsSet,
    failedIds: state.failedIds,
    monthTotal: state.monthTotal,
    progress: state.progress,
    monthLoading: state.monthLoading,
    chartLoading: state.yearLoading,
    chartPoints,
    refreshAll,
    retryFailed,
  };
}
