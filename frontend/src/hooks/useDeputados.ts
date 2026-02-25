import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addFavoriteRequest,
  listDeputadosRequest,
  listFavoritesRequest,
  removeFavoriteRequest,
  syncDeputadosRequest,
} from '../services/endpoints';
import { Deputy } from '../types/api';
import { getApiErrorMessage } from '../utils/apiError';

interface DeputadosFilters {
  query: string;
  uf: string;
  partido: string;
}

const PAGE_SIZE = 20;

export function useDeputados() {
  const [items, setItems] = useState<Deputy[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<DeputadosFilters>({ query: '', uf: '', partido: '' });
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(filters.query.trim().toLowerCase());
    }, 350);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.query]);

  const loadFavorites = useCallback(async () => {
    const favorites = await listFavoritesRequest();
    const ids = new Set<number>();

    favorites.forEach((item) => {
      const id = Number(item.deputadoId ?? item.deputyId ?? item.id);
      if (Number.isFinite(id)) {
        ids.add(id);
      }
    });

    setFavoriteIds(ids);
  }, []);

  const load = useCallback(async (targetPage: number, replace = false) => {
    const response = await listDeputadosRequest({ pagina: targetPage, itens: PAGE_SIZE });
    const data = response.data || [];
    setHasMore(data.length >= PAGE_SIZE);
    setItems((prev) => (replace ? data : [...prev, ...data]));
    setPage(targetPage);
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([load(1, true), loadFavorites()]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao carregar deputados.'));
    } finally {
      setLoading(false);
    }
  }, [load, loadFavorites]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const filtered = useMemo(() => {
    const normalizedUf = filters.uf.trim().toLowerCase();
    const normalizedPartido = filters.partido.trim().toLowerCase();

    return items.filter((item) => {
      if (debouncedQuery && !String(item.nome || '').toLowerCase().includes(debouncedQuery)) return false;
      if (normalizedUf && !String(item.siglaUf || '').toLowerCase().includes(normalizedUf)) return false;
      if (normalizedPartido && !String(item.siglaPartido || '').toLowerCase().includes(normalizedPartido)) return false;
      return true;
    });
  }, [items, debouncedQuery, filters.uf, filters.partido]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      await Promise.all([load(1, true), loadFavorites()]);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [load, loadFavorites]);

  const onLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await load(page + 1);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, load, loadingMore, page]);

  const toggleFavorite = useCallback(async (deputyId: number) => {
    try {
      setError(null);
      if (favoriteIds.has(deputyId)) {
        await removeFavoriteRequest(deputyId);
      } else {
        await addFavoriteRequest(deputyId);
      }
      await loadFavorites();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Nao foi possivel atualizar favorito.'));
    }
  }, [favoriteIds, loadFavorites]);

  const syncDeputados = useCallback(async () => {
    try {
      setSyncing(true);
      setError(null);
      await syncDeputadosRequest();
      await onRefresh();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao sincronizar deputados.'));
    } finally {
      setSyncing(false);
    }
  }, [onRefresh]);

  return {
    items: filtered,
    page,
    loading,
    refreshing,
    loadingMore,
    syncing,
    hasMore,
    error,
    favoriteIds,
    filters,
    setFilters,
    onRefresh,
    onLoadMore,
    toggleFavorite,
    syncDeputados,
  };
}

