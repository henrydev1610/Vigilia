import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef } from 'react';
import {
  deputadoDetailRequest,
  deputyExpensesRequest,
  expenseTypesRequest,
  getDeputadoMonthlyTotalRequest,
  getDeputadoYearResumoRequest,
  syncDeputadosMesRequest,
  syncDeputyExpensesRequest,
} from '../services/endpoints';
import { mapDeputy, mapExpense } from '../services/mappers';
import { getApiErrorMessage } from '../utils/apiError';
import { dedupeByKey, mergeUniqueById, stableKeyFromDespesa } from '../utils/keys';
import { normalizeMonthlySeries } from '../utils/series';

const PAGE_SIZE = 20;
const DETAIL_FILTER_STORAGE_PREFIX = 'detail:filters:deputado:';
const DETAIL_TOTAL_STORAGE_PREFIX = 'detail:lastTotal:deputado:';

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
  const [lastPersistedTotal, setLastPersistedTotal] = useState<number | null>(null);
  const autoSyncDoneRef = useRef<Set<string>>(new Set());

  const filterStorageKey = `${DETAIL_FILTER_STORAGE_PREFIX}${deputyId}`;
  const totalStorageKey = `${DETAIL_TOTAL_STORAGE_PREFIX}${deputyId}`;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [rawFilters, rawTotal] = await Promise.all([
          AsyncStorage.getItem(filterStorageKey),
          AsyncStorage.getItem(totalStorageKey),
        ]);
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

        if (rawTotal) {
          const parsedTotal = Number(rawTotal);
          if (Number.isFinite(parsedTotal)) {
            setLastPersistedTotal(parsedTotal);
          }
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
  }, [currentMonth, currentYear, filterStorageKey, totalStorageKey]);

  useEffect(() => {
    if (!filtersReady) return;
    void AsyncStorage.setItem(filterStorageKey, JSON.stringify({ ano: appliedAno, mes: appliedMes }));
  }, [appliedAno, appliedMes, filterStorageKey, filtersReady]);

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
    queryFn: async ({ pageParam }) => {
      const rows = await deputyExpensesRequest(deputyId, {
        ano: Number(appliedAno) || undefined,
        mes: Number(appliedMes) || undefined,
        pagina: pageParam,
        itens: PAGE_SIZE,
      });

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

  const monthlyTotalQuery = useQuery({
    queryKey: ['deputado', deputyId, 'resumo', appliedAno, appliedMes],
    queryFn: () =>
      getDeputadoMonthlyTotalRequest(deputyId, {
        ano: Number(appliedAno) || undefined,
        mes: Number(appliedMes) || undefined,
      }),
    enabled: isFocused && filtersReady,
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  const yearlyResumoQuery = useQuery({
    queryKey: ['deputado', deputyId, 'resumo-anual', appliedAno],
    queryFn: () => getDeputadoYearResumoRequest(deputyId, { ano: Number(appliedAno) || new Date().getFullYear() }),
    enabled: isFocused && filtersReady,
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    const nextError = deputyQuery.error
      ?? despesasQuery.error
      ?? monthlyTotalQuery.error
      ?? yearlyResumoQuery.error
      ?? null;
    if (!nextError) {
      setError(null);
      return;
    }
    setError(getApiErrorMessage(nextError, 'Falha ao carregar detalhes do deputado.'));
  }, [deputyQuery.error, despesasQuery.error, monthlyTotalQuery.error, yearlyResumoQuery.error]);

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

  const monthlyTotalFromExpenses = useMemo(
    () => expenses.reduce((acc, item) => acc + Number(item.valor || 0), 0),
    [expenses],
  );

  const monthlyTotal = useMemo(() => {
    if (monthlyTotalQuery.isSuccess) {
      return Number(monthlyTotalQuery.data ?? 0);
    }
    if (expenses.length > 0) {
      return monthlyTotalFromExpenses;
    }
    if (lastPersistedTotal !== null) {
      return lastPersistedTotal;
    }
    return 0;
  }, [expenses.length, lastPersistedTotal, monthlyTotalFromExpenses, monthlyTotalQuery.data, monthlyTotalQuery.isSuccess]);

  useEffect(() => {
    if (!monthlyTotalQuery.isSuccess) return;
    const value = Number(monthlyTotalQuery.data ?? 0);
    if (!Number.isFinite(value)) return;
    setLastPersistedTotal(value);
    void AsyncStorage.setItem(totalStorageKey, String(value));
  }, [monthlyTotalQuery.data, monthlyTotalQuery.isSuccess, totalStorageKey]);

  const chartPoints = useMemo(() => {
    const raw = (yearlyResumoQuery.data?.totalsByMonth ?? []).map((item) => ({
      ano: Number(appliedAno),
      mes: Number(item.mes),
      total: Number(item.totalMes ?? 0),
    }));
    const normalized = normalizeMonthlySeries(raw, Number(appliedAno));
    return normalized.map((point) => ({
      key: point.key,
      label: point.label,
      value: point.total,
    }));
  }, [appliedAno, yearlyResumoQuery.data?.totalsByMonth]);

  const applyFilters = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      setAppliedAno(ano);
      setAppliedMes(mes);
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
        queryClient.invalidateQueries({ queryKey: ['deputado', deputyId, 'resumo', appliedAno, appliedMes] }),
        queryClient.invalidateQueries({ queryKey: ['deputado', deputyId, 'resumo-anual', appliedAno] }),
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
        queryClient.invalidateQueries({ queryKey: ['deputado', deputyId, 'resumo', appliedAno, appliedMes] }),
        queryClient.invalidateQueries({ queryKey: ['deputado', deputyId, 'resumo-anual', appliedAno] }),
        queryClient.invalidateQueries({ queryKey: ['deputados', `${appliedAno}-${String(Number(appliedMes)).padStart(2, '0')}`] }),
        queryClient.invalidateQueries({ queryKey: ['deputados-resumo', `${appliedAno}-${String(Number(appliedMes)).padStart(2, '0')}`] }),
      ]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao sincronizar automaticamente o mês.'));
      autoSyncDoneRef.current.delete(cycleKey);
    }
  }, [appliedAno, appliedMes, deputyId, filtersReady, queryClient]);

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
          queryKey: ['deputado', deputyId, 'resumo', appliedAno, appliedMes],
          exact: true,
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: ['deputado', deputyId, 'despesas', appliedAno, appliedMes],
          refetchType: 'active',
        }),
      ]);
      return undefined;
    }, [appliedAno, appliedMes, autoSyncCurrentMonth, deputyId, filtersReady, queryClient]),
  );

  return {
    deputy: deputyQuery.data ?? null,
    expenses,
    selectedExpense,
    setSelectedExpenseId,
    ano,
    mes,
    setAno,
    setMes,
    expenseTypeMap,
    monthlyTotal,
    monthlyTotalLoading: monthlyTotalQuery.isLoading || monthlyTotalQuery.isFetching,
    monthlyTotalConfirmed: monthlyTotalQuery.isSuccess,
    chartPoints,
    chartLoading: yearlyResumoQuery.isLoading || (yearlyResumoQuery.isFetching && !yearlyResumoQuery.data),
    loading: !filtersReady || deputyQuery.isLoading || despesasQuery.isLoading || monthlyTotalQuery.isLoading,
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

