import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { monthExpensesRequest } from '../services/endpoints';
import { AppTabParamList } from '../navigation/types';
import { formatCurrencyBRL, formatDateBR } from '../utils/format';
import { fallbackFonts, useAppTheme } from '../theme';
import { Card, ErrorBanner, LoadingState, Screen } from '../components/ui';
import { CategoryBarsCard } from '../components/dashboard';
import { buildDynamicCategoryBars, canonicalCategoryName, HOME_CATEGORY_ORDER } from '../utils/expenseCategories';
import { getApiErrorMessage } from '../utils/apiError';
import { toNumberBR } from '../utils/money';
import { MonthExpenseItem } from '../types/api';

type GastosRoute = RouteProp<AppTabParamList, 'Gastos'>;

type ExpenseRow = {
  id: string;
  deputado: string;
  partidoUf: string;
  fornecedor: string;
  categoria: string;
  data: string;
  valor: number;
};

const PAGE_SIZE = 50;

export const ExpensesScreen: React.FC = () => {
  const theme = useAppTheme();
  const route = useRoute<GastosRoute>();

  const now = useMemo(() => new Date(), []);
  const [ano, setAno] = useState(route.params?.ano ?? now.getFullYear());
  const [mes, setMes] = useState(route.params?.mes ?? now.getMonth() + 1);

  const [items, setItems] = useState<ExpenseRow[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; valueLabel: string; progress: number }>>(
    HOME_CATEGORY_ORDER.map((name) => ({ name, valueLabel: formatCurrencyBRL(0), progress: 0 })),
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  const normalizeCategories = useCallback((raw: Array<{ name: string; total: number; percent: number }>) => {
    const normalizedBars = buildDynamicCategoryBars(raw);
    const normalized = normalizedBars.length
      ? normalizedBars.map((item) => ({
        name: item.name,
        valueLabel: formatCurrencyBRL(item.total),
        progress: item.progress,
      }))
      : HOME_CATEGORY_ORDER.map((name) => ({
        name,
        valueLabel: formatCurrencyBRL(0),
        progress: 0,
      }));

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[gastos] normalized.categories', normalized);
      // eslint-disable-next-line no-console
      console.log('[gastos] rendered.categories.length', normalized.length);
    }

    return normalized;
  }, []);

  const toRow = useCallback((item: MonthExpenseItem): ExpenseRow => ({
    id: item.id,
    deputado: item.deputyName,
    partidoUf: `${item.siglaPartido}/${item.siglaUf}`,
    fornecedor: item.fornecedor ?? 'Fornecedor não informado',
    categoria: canonicalCategoryName(item.categoryLabel),
    data: item.dataDocumento ?? '',
    valor: toNumberBR(item.valorLiquido),
  }), []);

  const loadPage = useCallback(async (targetPage: number, replace = false) => {
    const requestId = requestIdRef.current;
    const response = await monthExpensesRequest({ ano, mes, pagina: targetPage, itens: PAGE_SIZE });

    if (__DEV__ && targetPage === 1) {
      // eslint-disable-next-line no-console
      console.log('[gastos] raw.response', response);
    }

    if (requestId !== requestIdRef.current) return;

    setCategories(normalizeCategories(response.meta?.categories ?? []));

    const mapped = (response.data ?? []).map(toRow);
    setItems((prev) => (replace ? mapped : [...prev, ...mapped]));
    setPage(targetPage);

    const totalPaginas = Number(response.meta?.totalPaginas ?? 1);
    setHasMore(targetPage < totalPaginas);
  }, [ano, mes, normalizeCategories, toRow]);

  const bootstrap = useCallback(async () => {
    requestIdRef.current += 1;
    setLoading(true);
    setError(null);
    try {
      await loadPage(1, true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao carregar despesas do mês.'));
    } finally {
      setLoading(false);
    }
  }, [loadPage]);

  useEffect(() => {
    setAno(route.params?.ano ?? now.getFullYear());
    setMes(route.params?.mes ?? now.getMonth() + 1);
  }, [now, route.params?.ano, route.params?.mes]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap, ano, mes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await bootstrap();
    } finally {
      setRefreshing(false);
    }
  }, [bootstrap]);

  const onEndReached = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    try {
      await loadPage(page + 1);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao carregar mais despesas.'));
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadPage, loading, loadingMore, page]);

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.text, fontFamily: fallbackFonts.headingBold }]}>Gastos</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>Despesas do mês {String(mes).padStart(2, '0')}/{ano}.</Text>

      {error ? <ErrorBanner message={error} onAction={onRefresh} /> : null}

      <CategoryBarsCard items={categories} />

      {loading ? <LoadingState label="Carregando despesas reais..." /> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        onEndReachedThreshold={0.35}
        onEndReached={onEndReached}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        ListFooterComponent={loadingMore ? <LoadingState label="Carregando mais..." /> : <View style={styles.footerGap} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={[styles.itemTitle, { color: theme.colors.text, fontFamily: fallbackFonts.bodyMedium }]}>{item.categoria}</Text>
            <Text style={[styles.meta, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>
              {item.deputado} ({item.partidoUf})
            </Text>
            <Text style={[styles.meta, { color: theme.colors.textSecondary, fontFamily: fallbackFonts.body }]}>
              {item.fornecedor} • {formatDateBR(item.data)}
            </Text>
            <Text style={[styles.amount, { color: theme.colors.primary, fontFamily: fallbackFonts.heading }]}>{formatCurrencyBRL(item.valor)}</Text>
          </Card>
        )}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    marginTop: 8,
  },
  subtitle: {
    marginBottom: 12,
    marginTop: 4,
  },
  card: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 14,
  },
  meta: {
    marginBottom: 6,
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    marginBottom: 4,
  },
  footerGap: {
    height: 24,
  },
});
