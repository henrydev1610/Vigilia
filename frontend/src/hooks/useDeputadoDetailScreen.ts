import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deputadoDetailRequest,
  deputyExpensesRequest,
  expenseTypesRequest,
  syncDeputadosMesRequest,
  syncDeputyExpensesRequest,
} from '../services/endpoints';
import { logApiDiagnosticsOnce } from '../services/api';
import { mapDeputy, mapExpense } from '../services/mappers';
import { getApiErrorMessage } from '../utils/apiError';
import { dedupeByKey, mergeUniqueById, stableKeyFromDespesa } from '../utils/keys';

const PAGE_SIZE = 20;
const AGGREGATE_PAGE_SIZE = 100;
const DETAIL_FILTER_STORAGE_PREFIX = 'detail:filters:deputado:';

function buildPeriodRef(ano: string, mes: string) {
  return `${ano}-${Number(mes) || 1}`;
}

function buildMonthlySummaryCacheKey(deputyId: number, ano: string, mes: string) {
  return `${deputyId}:${buildPeriodRef(ano, mes)}`;
}

function extractLocalYmd(value: string) {
  const direct = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (direct) {
    return `${direct[1]}-${direct[2]}-${direct[3]}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isCanceledError(error: unknown) {
  const source = error as { code?: string; name?: string; message?: string } | undefined;
  if (!source) return false;
  return source.code === 'ERR_CANCELED' || source.name === 'CanceledError' || source.message === 'canceled';
}

export function useDeputadoDetailScreen(deputyId: number) {
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const currentYear = String(new Date().getFullYear());
  const currentMonth = String(new Date().getMonth() + 1);

  const [ano, setAno] = useState(currentYear);
  const [mes, setMes] = useState(currentMonth);
  const [appliedAno, setAppliedAno] = useState(currentYear);
  const [appliedMes, setAppliedMes] = useState(currentMonth);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filtersReady, setFiltersReady] = useState(false);
  const autoSyncDoneRef = useRef<Set<string>>(new Set());
  const filterDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filterStorageKey = `${DETAIL_FILTER_STORAGE_PREFIX}${deputyId}`;
  const summaryCacheKey = buildMonthlySummaryCacheKey(deputyId, appliedAno, appliedMes);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rawFilters = await AsyncStorage.getItem(filterStorageKey);
        if (!active) return;

        if (rawFilters) {
          const parsed = JSON.parse(rawFilters) as { ano?: string; mes?: string };
          const nextAno = parsed?.ano ? String(parsed.ano) : currentYear;
          const nextMes = parsed?.mes ? String(parsed.mes) : currentMonth;
          setAno(nextAno);
          setMes(nextMes);
          setAppliedAno(nextAno);
          setAppliedMes(nextMes);
        }
      } catch {
        // ignore local storage errors
      } finally {
        if (active) {
          setFiltersReady(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [currentMonth, currentYear, filterStorageKey]);

  useEffect(() => {
    if (!filtersReady) return;
    void AsyncStorage.setItem(filterStorageKey, JSON.stringify({ ano: appliedAno, mes: appliedMes }));
  }, [appliedAno, appliedMes, filterStorageKey, filtersReady]);

  useEffect(() => () => {
    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
      filterDebounceRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isFocused || !__DEV__) return;
    void logApiDiagnosticsOnce('DeputadoDetailScreen');
  }, [isFocused]);

  const deputyQuery = useQuery({
    queryKey: ['deputado', deputyId, 'profile'],
    queryFn: async () => mapDeputy(await deputadoDetailRequest(deputyId)),
    enabled: isFocused && filtersReady,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
  });

  const expenseTypesQuery = useQuery({
    queryKey: ['deputado', deputyId, 'expense-types'],
    queryFn: async () => expenseTypesRequest().catch(() => []),
    enabled: isFocused && filtersReady,
    staleTime: 30 * 60 * 1000,
    refetchOnMount: 'always',
  });

  const despesasQuery = useInfiniteQuery({
    queryKey: ['deputado', deputyId, 'despesas', appliedAno, appliedMes],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const rows = await deputyExpensesRequest(
        deputyId,
        {
          ano: Number(appliedAno) || undefined,
          mes: Number(appliedMes) || undefined,
          pagina: pageParam,
          itens: PAGE_SIZE,
        },
        { signal },
      );

      const mapped = dedupeByKey(
        rows.map((item) => {
          const vm = mapExpense(item);
          return {
            ...vm,
            id: stableKeyFromDespesa(vm, { deputadoId: deputyId, ano: appliedAno, mes: appliedMes }),
          };
        }),
        (item) => item.id,
      );

      return {
        page: pageParam,
        rows: mapped,
        hasMore: rows.length >= PAGE_SIZE,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled: isFocused && filtersReady,
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  const monthlySummaryQuery = useQuery({
    queryKey: ['deputado', deputyId, 'resumo-mensal', summaryCacheKey],
    queryFn: async ({ signal }) => {
      const anoRef = Number(appliedAno) || undefined;
      const mesRef = Number(appliedMes) || undefined;
      const byId = new Map<string, ReturnType<typeof mapExpense>>();
      let page = 1;

      while (true) {
        const rows = await deputyExpensesRequest(
          deputyId,
          {
            ano: anoRef,
            mes: mesRef,
            pagina: page,
            itens: AGGREGATE_PAGE_SIZE,
          },
          { signal },
        );

        rows.forEach((item) => {
          const vm = mapExpense(item);
          const id = stableKeyFromDespesa(vm, { deputadoId: deputyId, ano: appliedAno, mes: appliedMes });
          byId.set(id, { ...vm, id });
        });

        if (__DEV__ && page === 1) {
          // eslint-disable-next-line no-console
          console.log('[detail] summary.raw', {
            deputyId,
            ano: anoRef,
            mes: mesRef,
            rows: rows.length,
          });
        }

        if (rows.length < AGGREGATE_PAGE_SIZE) {
          break;
        }
        page += 1;
      }

      const despesas = Array.from(byId.values());
      const totalPorDia = new Map<string, number>();
      let totalMensal = 0;

      despesas.forEach((item) => {
        const ymd = extractLocalYmd(item.data);
        if (!ymd) return;
        const current = totalPorDia.get(ymd) ?? 0;
        const valor = Number(item.valor || 0);
        totalPorDia.set(ymd, current + valor);
        totalMensal += valor;
      });

      return {
        totalMensal,
        totalPorDia: Array.from(totalPorDia.entries()).map(([date, total]) => ({ date, total })),
        despesas,
      };
    },
    enabled: isFocused && filtersReady,
    staleTime: 45 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    const nextError = deputyQuery.error ?? despesasQuery.error ?? monthlySummaryQuery.error ?? null;
    if (!nextError || isCanceledError(nextError)) {
      setError(null);
      return;
    }
    setError(getApiErrorMessage(nextError, 'Falha ao carregar detalhes do deputado.'));
  }, [deputyQuery.error, despesasQuery.error, monthlySummaryQuery.error]);

  const expenses = useMemo(() => {
    const pages = despesasQuery.data?.pages ?? [];
    const merged = pages.reduce<ReturnType<typeof mapExpense>[]>((acc, page) => {
      return mergeUniqueById(acc, page.rows, (item) => item.id);
    }, []);
    return merged;
  }, [despesasQuery.data?.pages]);

  const selectedExpense = useMemo(
    () => expenses.find((item) => item.id === selectedExpenseId) ?? null,
    [expenses, selectedExpenseId],
  );

  const expenseTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    (expenseTypesQuery.data ?? []).forEach((item) => {
      const key = String(item.codigo ?? item.id ?? '').trim();
      const label = String(item.nome ?? item.descricao ?? '').trim();
      if (key && label) map.set(key, label);
    });
    return map;
  }, [expenseTypesQuery.data]);

  const monthlyTotal = useMemo(() => {
    if (monthlySummaryQuery.data) {
      return Number(monthlySummaryQuery.data.totalMensal ?? 0);
    }
    if (expenses.length > 0) {
      return expenses.reduce((acc, item) => acc + Number(item.valor || 0), 0);
    }
    return 0;
  }, [expenses, monthlySummaryQuery.data]);

  const chartExpenses = useMemo(() => monthlySummaryQuery.data?.despesas ?? expenses, [expenses, monthlySummaryQuery.data?.despesas]);
  const monthlyTotalLoading = monthlySummaryQuery.isLoading || (monthlySummaryQuery.isFetching && !monthlySummaryQuery.data);
  const chartLoading = monthlySummaryQuery.isLoading || (monthlySummaryQuery.isFetching && !monthlySummaryQuery.data);

  useEffect(() => {
    if (!__DEV__) return;
    // eslint-disable-next-line no-console
    console.log('[detail] summary.final', {
      deputyId,
      ano: appliedAno,
      mes: appliedMes,
      totalMensal: monthlyTotal,
      chartPoints: chartExpenses.length,
      monthlySummaryLoaded: Boolean(monthlySummaryQuery.data),
    });
  }, [appliedAno, appliedMes, chartExpenses.length, deputyId, monthlySummaryQuery.data, monthlyTotal]);

  const applyFilters = useCallback(async (next?: { ano?: string; mes?: string }) => {
    setRefreshing(true);
    setError(null);
    try {
      const nextAno = String(next?.ano ?? ano);
      const nextMes = String(next?.mes ?? mes);
      if (next?.ano) setAno(nextAno);
      if (next?.mes) setMes(nextMes);
      if (next?.ano || next?.mes) {
        if (filterDebounceRef.current) {
          clearTimeout(filterDebounceRef.current);
        }
        await new Promise<void>((resolve) => {
          filterDebounceRef.current = setTimeout(() => {
            setAppliedAno(nextAno);
            setAppliedMes(nextMes);
            filterDebounceRef.current = null;
            resolve();
          }, 250);
        });
      } else {
        setAppliedAno(nextAno);
        setAppliedMes(nextMes);
      }
    } finally {
      setRefreshing(false);
    }
  }, [ano, mes]);

  const syncMutation = useMutation({
    mutationFn: async () => {
      await syncDeputyExpensesRequest(deputyId, {
        ano: Number(appliedAno) || undefined,
        mes: Number(appliedMes) || undefined,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['deputado', deputyId, 'despesas', appliedAno, appliedMes] }),
        queryClient.invalidateQueries({ queryKey: ['deputado', deputyId, 'resumo-mensal', summaryCacheKey] }),
        queryClient.invalidateQueries({ queryKey: ['deputados', `${appliedAno}-${String(Number(appliedMes)).padStart(2, '0')}`] }),
        queryClient.invalidateQueries({ queryKey: ['deputados-resumo', `${appliedAno}-${String(Number(appliedMes)).padStart(2, '0')}`] }),
      ]);
    },
  });

  const syncExpenses = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      await syncMutation.mutateAsync();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao sincronizar despesas.'));
    } finally {
      setSyncing(false);
    }
  }, [syncMutation]);

  const autoSyncCurrentMonth = useCallback(async () => {
    if (!filtersReady) return;

    const cycleKey = `${deputyId}:${appliedAno}:${appliedMes}`;
    if (autoSyncDoneRef.current.has(cycleKey)) {
      return;
    }

    autoSyncDoneRef.current.add(cycleKey);
    try {
      await syncDeputadosMesRequest({
        ano: Number(appliedAno) || new Date().getFullYear(),
        mes: Number(appliedMes) || new Date().getMonth() + 1,
        force: false,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['deputado', deputyId, 'despesas', appliedAno, appliedMes] }),
        queryClient.invalidateQueries({ queryKey: ['deputado', deputyId, 'resumo-mensal', summaryCacheKey] }),
        queryClient.invalidateQueries({ queryKey: ['deputados', `${appliedAno}-${String(Number(appliedMes)).padStart(2, '0')}`] }),
        queryClient.invalidateQueries({ queryKey: ['deputados-resumo', `${appliedAno}-${String(Number(appliedMes)).padStart(2, '0')}`] }),
      ]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao sincronizar automaticamente o mes.'));
      autoSyncDoneRef.current.delete(cycleKey);
    }
  }, [appliedAno, appliedMes, deputyId, filtersReady, queryClient, summaryCacheKey]);

  const onLoadMore = useCallback(async () => {
    if (!despesasQuery.hasNextPage || despesasQuery.isFetchingNextPage) return;
    await despesasQuery.fetchNextPage();
  }, [despesasQuery]);

  useFocusEffect(
    useCallback(() => {
      if (!filtersReady) return undefined;
      void autoSyncCurrentMonth();
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['deputado', deputyId, 'resumo-mensal', summaryCacheKey],
          exact: true,
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: ['deputado', deputyId, 'despesas', appliedAno, appliedMes],
          refetchType: 'active',
        }),
      ]);
      return undefined;
    }, [appliedAno, appliedMes, autoSyncCurrentMonth, deputyId, filtersReady, queryClient, summaryCacheKey]),
  );

  return {
    deputy: deputyQuery.data ?? null,
    expenses,
    selectedExpense,
    chartExpenses,
    setSelectedExpenseId,
    ano,
    mes,
    setAno,
    setMes,
    expenseTypeMap,
    monthlyTotal,
    monthlyTotalLoading,
    monthlyTotalConfirmed: Boolean(monthlySummaryQuery.data),
    chartLoading,
    loading: !filtersReady || deputyQuery.isLoading || despesasQuery.isLoading || monthlySummaryQuery.isLoading,
    refreshing,
    loadingMore: despesasQuery.isFetchingNextPage,
    syncing,
    hasMore: Boolean(despesasQuery.hasNextPage),
    error,
    applyFilters,
    onLoadMore,
    syncExpenses,
  };
}
