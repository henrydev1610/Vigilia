import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { onlineManager, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addFavoriteRequest,
  deputadosResumoMesRequest,
  listDeputadosRequest,
  listFavoritesRequest,
  removeFavoriteRequest,
  syncDeputadosMesRequest,
} from '../services/endpoints';
import { mapDeputy } from '../services/mappers';
import { getApiErrorMessage } from '../utils/apiError';
import { BRAZIL_UFS } from '../constants/ufs';
import { getMandateYearsConfig, getNearestAvailableYear } from '../config/mandateYears';
import { dedupeByKey, stableKeyFromDeputado } from '../utils/keys';
import { dedupeStrings } from '../utils/dedupe';
import { normalizeMonthlySeries } from '../utils/series';
import { getApiRequestErrorDetails, getApiResolution, getRateLimitSnapshot, subscribeRateLimit } from '../services/api';

interface DeputadosFilters {
  search: string;
  uf: string;
  partido: string;
  sort: 'highest_spending' | 'lowest_spending' | 'alphabetical' | 'highest_usage';
  ano: number;
  mes: number;
}

const LIST_LIMIT = 600;
type ExploreErrorType = 'network' | 'http' | 'parse' | 'unknown' | null;

function classifyExploreError(error: unknown): ExploreErrorType {
  const details = getApiRequestErrorDetails(error);
  if (details.kind === 'network') return 'network';
  if (details.kind === 'http') return 'http';
  if (error instanceof SyntaxError || error instanceof TypeError) return 'parse';
  return 'unknown';
}

function buildMonthRef(ano: number, mes: number) {
  return `${ano}-${String(Math.max(1, Math.min(12, mes))).padStart(2, '0')}`;
}

export function useDeputadosScreenController() {
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const availableYears = useMemo(() => getMandateYearsConfig(), []);
  const initialYear = useMemo(() => getNearestAvailableYear(currentYear, availableYears), [availableYears, currentYear]);

  const [filters, setFilters] = useState<DeputadosFilters>({
    search: '',
    uf: '',
    partido: '',
    sort: 'highest_spending',
    ano: initialYear,
    mes: currentMonth,
  });
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ExploreErrorType>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<'success' | 'warning' | 'error'>('success');
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [rateLimitedSeconds, setRateLimitedSeconds] = useState(0);
  const autoSyncDoneRef = useRef<Set<string>>(new Set());
  const syncMutexRef = useRef(false);

  const monthRef = useMemo(() => buildMonthRef(filters.ano, filters.mes), [filters.ano, filters.mes]);

  const deputadosQuery = useQuery({
    queryKey: ['deputados', monthRef],
    queryFn: async () => {
      const result = await listDeputadosRequest({
        ano: filters.ano,
        mesNumero: filters.mes,
        itens: LIST_LIMIT,
        pagina: 1,
      });
      return {
        rows: dedupeByKey(result.data.map((item) => mapDeputy(item)), (item) => stableKeyFromDeputado(item)),
        meta: (result as any).meta ?? null,
      };
    },
    enabled: isFocused,
    staleTime: 60 * 1000,
  });

  const resumoQuery = useQuery({
    queryKey: ['deputados-resumo', monthRef],
    queryFn: () => deputadosResumoMesRequest(monthRef),
    enabled: isFocused,
    staleTime: 60 * 1000,
  });

  const loadFavorites = useCallback(async () => {
    try {
      const favorites = await listFavoritesRequest();
      const ids = new Set<number>();
      favorites.forEach((item) => {
        const id = Number(item.deputadoId ?? item.deputyId ?? item.id);
        if (Number.isFinite(id)) ids.add(id);
      });
      setFavoriteIds(ids);
    } catch (err) {
      const details = getApiRequestErrorDetails(err);
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[explorar:favorites:error]', {
          kind: details.kind,
          status: details.status ?? null,
          code: details.code ?? null,
          message: details.message,
          stack: err instanceof Error ? err.stack : null,
        });
      }
      setMessage(getApiErrorMessage(err, 'Falha ao carregar favoritos.'));
      setMessageTone('warning');
    }
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    void loadFavorites();
  }, [isFocused, loadFavorites]);

  useEffect(() => {
    const unsubscribe = subscribeRateLimit((snapshot) => {
      const seconds = snapshot.isLimited ? Math.max(1, Math.ceil(snapshot.remainingMs / 1000)) : 0;
      setRateLimitedSeconds(seconds);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!__DEV__ || !isFocused) return;
    const resolution = getApiResolution();
    // eslint-disable-next-line no-console
    console.log('[explorar:api]', {
      baseUrl: resolution.baseUrl,
      source: resolution.source,
      deputadosEndpoint: '/api/deputados',
      resumoEndpoint: '/api/deputados/resumo',
      connectivity: onlineManager.isOnline(),
    });
  }, [isFocused]);

  useEffect(() => {
    if (deputadosQuery.error) {
      const details = getApiRequestErrorDetails(deputadosQuery.error);
      const type = classifyExploreError(deputadosQuery.error);
      const hasMainRows = (deputadosQuery.data?.rows?.length ?? 0) > 0;

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[explorar:deputados:error]', {
          kind: details.kind,
          status: details.status ?? null,
          code: details.code ?? null,
          message: details.message,
          stack: deputadosQuery.error instanceof Error ? deputadosQuery.error.stack : null,
          hasMainRows,
        });
      }

      if (!hasMainRows && type === 'network') {
        setError(getApiErrorMessage(deputadosQuery.error, 'Falha de conexao ao carregar lista de deputados.'));
        setErrorType('network');
        return;
      }

      setError(null);
      setErrorType(null);
      setMessage(getApiErrorMessage(deputadosQuery.error, 'Falha ao carregar lista de deputados.'));
      setMessageTone(type === 'http' ? 'warning' : 'error');
      return;
    }

    if (resumoQuery.error) {
      const details = getApiRequestErrorDetails(resumoQuery.error);
      const hasMainRows = (deputadosQuery.data?.rows?.length ?? 0) > 0;

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[explorar:resumo:error]', {
          kind: details.kind,
          status: details.status ?? null,
          code: details.code ?? null,
          message: details.message,
          stack: resumoQuery.error instanceof Error ? resumoQuery.error.stack : null,
          hasMainRows,
        });
      }

      setMessage(getApiErrorMessage(resumoQuery.error, 'Falha ao carregar resumo do mes.'));
      setMessageTone('warning');
    }

    setError(null);
    setErrorType(null);
  }, [deputadosQuery.data?.rows?.length, deputadosQuery.error, resumoQuery.error]);

  useEffect(() => {
    if (availableYears.length === 0) return;
    if (availableYears.includes(filters.ano)) return;
    const nearestYear = getNearestAvailableYear(filters.ano, availableYears);
    setFilters((prev) => ({ ...prev, ano: nearestYear }));
  }, [availableYears, filters.ano]);

  const items = useMemo(() => {
    const rows = deputadosQuery.data?.rows ?? [];
    const normalizedSearch = filters.search.trim().toLowerCase();
    const filtered = rows.filter((item) => {
      if (normalizedSearch && !item.nome.toLowerCase().includes(normalizedSearch)) return false;
      if (filters.uf && item.uf.toUpperCase() !== filters.uf.toUpperCase()) return false;
      if (filters.partido && item.partido.toUpperCase() !== filters.partido.toUpperCase()) return false;
      return true;
    });
    const sorted = [...filtered];

    switch (filters.sort) {
      case 'lowest_spending':
        sorted.sort((a, b) => Number(a.totalMes ?? 0) - Number(b.totalMes ?? 0));
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        break;
      case 'highest_usage':
        sorted.sort((a, b) => (Number(b.totalMes ?? 0) / 46000) - (Number(a.totalMes ?? 0) / 46000));
        break;
      case 'highest_spending':
      default:
        sorted.sort((a, b) => Number(b.totalMes ?? 0) - Number(a.totalMes ?? 0));
        break;
    }

    return sorted;
  }, [deputadosQuery.data?.rows, filters.partido, filters.search, filters.sort, filters.uf]);

  const partidos = useMemo(() => {
    const set = new Set<string>();
    (deputadosQuery.data?.rows ?? []).forEach((item) => {
      const normalized = item.partido.trim().toUpperCase();
      if (normalized && normalized !== '--') set.add(normalized);
    });
    return dedupeStrings(Array.from(set));
  }, [deputadosQuery.data?.rows]);

  const deputyTotalsByMonth = useMemo(() => {
    const totals: Record<string, number> = {};
    (deputadosQuery.data?.rows ?? []).forEach((item) => {
      totals[String(item.id)] = Number(item.totalMes ?? 0);
    });
    return totals;
  }, [deputadosQuery.data?.rows]);

  const loadedDeputyTotals = useMemo(() => {
    return new Set<number>((deputadosQuery.data?.rows ?? []).map((item) => item.id));
  }, [deputadosQuery.data?.rows]);

  const totalMes = useMemo(() => Number(resumoQuery.data?.totalGeralMes ?? 0), [resumoQuery.data?.totalGeralMes]);

  const chartPoints = useMemo(() => {
    const raw = (resumoQuery.data?.totalsByMonth ?? []).map((item) => ({
      ano: filters.ano,
      mes: Number(item.mes),
      total: Number(item.total ?? 0),
    }));
    const normalized = normalizeMonthlySeries(raw, filters.ano);
    return normalized.map((point) => ({
      key: `month-${point.month}`,
      label: point.label,
      value: point.total,
    }));
  }, [filters.ano, resumoQuery.data?.totalsByMonth]);

  const syncMutation = useMutation({
    mutationFn: async (options?: { force?: boolean }) => {
      const rate = getRateLimitSnapshot();
      if (rate.isLimited) {
        const seconds = Math.max(1, Math.ceil(rate.remainingMs / 1000));
        throw new Error(`Servidor ocupado. Tente novamente em ${seconds}s.`);
      }
      if (syncMutexRef.current) {
        return { inProgress: true };
      }
      syncMutexRef.current = true;
      try {
        return await syncDeputadosMesRequest({
          ano: filters.ano,
          mes: filters.mes,
          force: Boolean(options?.force),
        });
      } finally {
        syncMutexRef.current = false;
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['deputados', monthRef] }),
        queryClient.invalidateQueries({ queryKey: ['deputados-resumo', monthRef] }),
      ]);
      setMessage('Base sincronizada com sucesso.');
      setMessageTone('success');
    },
    onError: (err) => {
      setMessage(getApiErrorMessage(err, 'Falha ao sincronizar deputados.'));
      setMessageTone('error');
    },
  });

  useEffect(() => {
    if (!isFocused) return;
    const cycleKey = `${filters.ano}-${filters.mes}`;
    if (autoSyncDoneRef.current.has(cycleKey)) {
      return;
    }

    const stale = Boolean(deputadosQuery.data?.meta?.stale || (resumoQuery.data as any)?.meta?.stale);
    if (!stale && deputadosQuery.data && resumoQuery.data) {
      autoSyncDoneRef.current.add(cycleKey);
      return;
    }

    autoSyncDoneRef.current.add(cycleKey);
    void syncMutation.mutateAsync({ force: false }).catch(() => {
      autoSyncDoneRef.current.delete(cycleKey);
    });
  }, [deputadosQuery.data, filters.ano, filters.mes, isFocused, resumoQuery.data, syncMutation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setMessage(null);
    setError(null);
    setErrorType(null);
    try {
      await Promise.all([
        deputadosQuery.refetch({ cancelRefetch: true }),
        resumoQuery.refetch({ cancelRefetch: true }),
        loadFavorites(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [deputadosQuery, resumoQuery, loadFavorites]);

  const onLoadMore = useCallback(async () => {
    return;
  }, []);

  const toggleFavorite = useCallback(async (deputyId: number) => {
    try {
      if (favoriteIds.has(deputyId)) {
        await removeFavoriteRequest(deputyId);
      } else {
        await addFavoriteRequest(deputyId);
      }
      await loadFavorites();
    } catch (err) {
      setMessage(getApiErrorMessage(err, 'Nao foi possivel atualizar favorito.'));
      setMessageTone('error');
    }
  }, [favoriteIds, loadFavorites]);

  const syncDeputados = useCallback(async () => {
    setSyncing(true);
    setMessage('Sincronizando base...');
    setMessageTone('warning');
    try {
      await syncMutation.mutateAsync({ force: true });
    } finally {
      setSyncing(false);
    }
  }, [syncMutation]);

  const retryFailedTotals = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  return {
    items,
    loading: deputadosQuery.isLoading || resumoQuery.isLoading,
    refreshing,
    loadingMore: false,
    syncing,
    error,
    errorType,
    message,
    messageTone,
    favoriteIds,
    filters,
    setFilters,
    onRefresh,
    onLoadMore,
    toggleFavorite,
    syncDeputados,
    totalMes,
    deputyTotalsByMonth,
    loadedDeputyTotals,
    failedDeputyTotals: [] as number[],
    retryFailedTotals,
    aggregationProgress: null as string | null,
    chartPoints,
    chartLoading: resumoQuery.isFetching && !resumoQuery.data,
    partidos,
    ufs: BRAZIL_UFS,
    availableYears,
    rateLimitedSeconds,
  };
}
