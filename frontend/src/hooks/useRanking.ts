import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { rankingCecapRequest, rankingCeapRequest } from '../services/endpoints';
import { RankingItem } from '../types/api';
import { getApiErrorMessage } from '../utils/apiError';
import { dedupeByKey, stableKeyFromDeputado } from '../utils/keys';
import { CACHE_KEYS } from '../cache/cacheKeys';
import { getCacheValue, setCacheValue } from '../cache/cacheManager';
import { getRateLimitSnapshot } from '../services/api';

type RankingMode = 'ceap' | 'cecap';

const RANKING_CACHE_TTL_MS = 5 * 60 * 1000;

export function useRanking() {
  const isFocused = useIsFocused();
  const hasLoadedForFocusRef = useRef(false);
  const [mode, setMode] = useState<RankingMode>('ceap');
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [limit, setLimit] = useState('20');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<RankingItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parsedAno = useMemo(() => Number(ano) || new Date().getFullYear(), [ano]);
  const parsedMes = useMemo(() => Number(mes) || new Date().getMonth() + 1, [mes]);
  const parsedLimit = useMemo(() => Number(limit) || 20, [limit]);

  const load = useCallback(async (isRefresh = false) => {
    const cacheKey = CACHE_KEYS.ranking(mode, parsedAno, parsedMes, parsedLimit);

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError(null);

      if (!isRefresh) {
        const cached = await getCacheValue<RankingItem[]>(cacheKey);
        if (cached?.value?.length) {
          setItems(cached.value);
        }
      }

      const rateSnapshot = getRateLimitSnapshot();
      if (rateSnapshot.isLimited && !isRefresh) {
        return;
      }

      const params = {
        ano: parsedAno || undefined,
        mes: parsedMes || undefined,
        limit: parsedLimit || undefined,
      };
      const data = mode === 'ceap' ? await rankingCeapRequest(params) : await rankingCecapRequest(params);
      const deduped = dedupeByKey(data, (item) => stableKeyFromDeputado(item));
      setItems(deduped);
      await setCacheValue(cacheKey, deduped, RANKING_CACHE_TTL_MS);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao carregar ranking.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, parsedAno, parsedLimit, parsedMes]);

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
    mode,
    setMode,
    ano,
    setAno,
    mes,
    setMes,
    limit,
    setLimit,
    loading,
    refreshing,
    items,
    error,
    load,
  };
}
