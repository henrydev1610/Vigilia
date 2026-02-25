import { useCallback, useEffect, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { listFavoritesRequest, removeFavoriteRequest } from '../services/endpoints';
import { FavoriteItem } from '../types/api';
import { getApiErrorMessage } from '../utils/apiError';
import { dedupeByKey, stableKeyFromDeputado } from '../utils/keys';
import { CACHE_KEYS } from '../cache/cacheKeys';
import { getCacheValue, setCacheValue } from '../cache/cacheManager';
import { getRateLimitSnapshot } from '../services/api';

const FAVORITES_CACHE_TTL_MS = 5 * 60 * 1000;

export function useFavoritos() {
  const isFocused = useIsFocused();
  const hasLoadedForFocusRef = useRef(false);
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      if (!isRefresh) {
        const cached = await getCacheValue<FavoriteItem[]>(CACHE_KEYS.favoritesList);
        if (cached?.value?.length) {
          setItems(cached.value);
        }
      }

      const rateSnapshot = getRateLimitSnapshot();
      if (rateSnapshot.isLimited && !isRefresh) {
        return;
      }

      const data = await listFavoritesRequest();
      const deduped = dedupeByKey(data, (item) => stableKeyFromDeputado(item));
      setItems(deduped);
      await setCacheValue(CACHE_KEYS.favoritesList, deduped, FAVORITES_CACHE_TTL_MS);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao carregar favoritos.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const removeFavorite = useCallback(async (item: FavoriteItem) => {
    const id = Number(item.deputadoId ?? item.deputyId ?? item.id);
    if (!Number.isFinite(id)) return;

    await removeFavoriteRequest(id);
    await load(true);
  }, [load]);

  useEffect(() => {
    if (!isFocused) {
      hasLoadedForFocusRef.current = false;
      return;
    }
    if (hasLoadedForFocusRef.current) {
      return;
    }
    hasLoadedForFocusRef.current = true;
    void load();
  }, [isFocused, load]);

  return {
    items,
    loading,
    refreshing,
    error,
    load,
    removeFavorite,
  };
}
