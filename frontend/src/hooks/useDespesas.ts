import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deputadoDetailRequest,
  deputyExpensesRequest,
  expenseTypesRequest,
  syncDeputyExpensesRequest,
} from '../services/endpoints';
import { Deputy, DeputyExpense, ExpenseType } from '../types/api';
import { getApiErrorMessage } from '../utils/apiError';
import { toNumberBR } from '../utils/money';

const PAGE_SIZE = 20;

export function useDespesas(deputyId: number) {
  const [deputy, setDeputy] = useState<Deputy | null>(null);
  const [expenses, setExpenses] = useState<DeputyExpense[]>([]);
  const [types, setTypes] = useState<ExpenseType[]>([]);
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [mes, setMes] = useState(String(new Date().getMonth() + 1));
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expenseTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    types.forEach((item) => {
      const key = String(item.codigo ?? item.id ?? '');
      const label = String(item.nome ?? item.descricao ?? '').trim();
      if (key && label) map.set(key, label);
    });
    return map;
  }, [types]);

  const loadExpenses = useCallback(async (targetPage: number, replace = false) => {
    const rows = await deputyExpensesRequest(deputyId, {
      ano: Number(ano) || undefined,
      mes: Number(mes) || undefined,
      pagina: targetPage,
      itens: PAGE_SIZE,
    });

    setExpenses((prev) => (replace ? rows : [...prev, ...rows]));
    setPage(targetPage);
    setHasMore(rows.length >= PAGE_SIZE);
    return rows;
  }, [ano, deputyId, mes]);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deputyData, expenseTypeData] = await Promise.all([
        deputadoDetailRequest(deputyId),
        expenseTypesRequest().catch(() => []),
      ]);
      setDeputy(deputyData);
      setTypes(expenseTypeData);
      await loadExpenses(1, true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao carregar detalhes do deputado.'));
    } finally {
      setLoading(false);
    }
  }, [deputyId, loadExpenses]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const applyFilters = useCallback(async () => {
    try {
      setError(null);
      setRefreshing(true);
      await loadExpenses(1, true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [loadExpenses]);

  const onLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await loadExpenses(page + 1);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadExpenses, loadingMore, page]);

  const syncExpenses = useCallback(async () => {
    setSyncing(true);
    try {
      setError(null);
      await syncDeputyExpensesRequest(deputyId, {
        ano: Number(ano) || undefined,
        mes: Number(mes) || undefined,
      });
      await applyFilters();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao sincronizar despesas.'));
    } finally {
      setSyncing(false);
    }
  }, [ano, applyFilters, deputyId, mes]);

  const monthlyTotal = useMemo(
    () => expenses.reduce((acc, item) => acc + toNumberBR(item.valorLiquido ?? item.valorDocumento), 0),
    [expenses],
  );

  return {
    deputy,
    expenses,
    ano,
    mes,
    setAno,
    setMes,
    expenseTypeMap,
    monthlyTotal,
    loading,
    refreshing,
    loadingMore,
    syncing,
    hasMore,
    error,
    applyFilters,
    onLoadMore,
    syncExpenses,
  };
}

