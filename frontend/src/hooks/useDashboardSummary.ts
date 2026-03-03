import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardResumoRequest } from '../services/endpoints';
import { DashboardData, DashboardRankingItem } from '../types/dashboard';
import { formatCurrencyBRL } from '../utils/format';
import { getApiErrorMessage } from '../utils/apiError';

const CATEGORY_ORDER = ['Combustível', 'Passagens Aéreas', 'Manutenção Gabinete', 'Divulgação'] as const;

function buildEmptyDashboard(): DashboardData {
  return {
    monthTotal: 0,
    monthDeltaPct: 0,
    topSpender: {
      name: 'Sem dados',
      amountLabel: formatCurrencyBRL(0),
    },
    yearDeltaPct: 0,
    categories: CATEGORY_ORDER.map((name) => ({
      name,
      valueLabel: formatCurrencyBRL(0),
      progress: 0,
    })),
    ranking: [],
    rankingTotalLabel: formatCurrencyBRL(0),
    alertsCount: 0,
  };
}

function mapRanking(raw: Array<{ deputyId: number; nome: string; siglaPartido: string; siglaUf: string; total: number }>): DashboardRankingItem[] {
  const peak = Math.max(0, ...raw.map((entry) => Number(entry.total || 0)));
  return raw.map((entry) => {
    const total = Number(entry.total || 0);
    const progress = peak > 0 ? Math.max(0, Math.min(1, total / peak)) : 0;
    return {
      deputyId: Number(entry.deputyId),
      name: entry.nome,
      party: entry.siglaPartido,
      uf: entry.siglaUf,
      valueLabel: formatCurrencyBRL(total),
      total,
      progress,
    };
  });
}

export function useDashboardSummary() {
  const now = useMemo(() => new Date(), []);
  const ano = now.getFullYear();
  const mes = now.getMonth() + 1;

  const query = useQuery({
    queryKey: ['dashboard-resumo', ano, mes],
    queryFn: async () => dashboardResumoRequest({ ano, mes }),
    staleTime: 60 * 1000,
  });

  const dashboard = useMemo<DashboardData>(() => {
    if (!query.data) {
      return buildEmptyDashboard();
    }

    const rawCategories = new Map(
      (query.data.categorias ?? []).map((item) => [
        String(item.nome),
        {
          total: Number(item.total || 0),
          percentual: Number(item.percentual || 0),
        },
      ]),
    );

    const categories = CATEGORY_ORDER.map((name) => {
      const category = rawCategories.get(name);
      const total = category?.total ?? 0;
      const progress = Math.max(0, Math.min(1, (category?.percentual ?? 0) / 100));
      return {
        name,
        valueLabel: formatCurrencyBRL(total),
        progress,
      };
    });

    const ranking = mapRanking(query.data.ranking ?? []);
    const rankingTotal = ranking.reduce((acc, item) => acc + item.total, 0);
    const top = query.data.maiorGasto;

    return {
      monthTotal: Number(query.data.totalMesAtual || 0),
      monthDeltaPct: Number(query.data.variacaoMensalPct || 0),
      topSpender: {
        name: top?.nome ?? 'Sem dados',
        amountLabel: formatCurrencyBRL(Number(top?.total || 0)),
      },
      yearDeltaPct: Number(query.data.variacaoAnualPct || 0),
      categories,
      ranking,
      rankingTotalLabel: formatCurrencyBRL(rankingTotal),
      alertsCount: Number(query.data.alertsCount || 0),
    };
  }, [query.data]);

  useEffect(() => {
    if (!__DEV__) return;
    // eslint-disable-next-line no-console
    console.log('[dashboard] raw.response', query.data ?? null);
  }, [query.data]);

  useEffect(() => {
    if (!__DEV__) return;
    // eslint-disable-next-line no-console
    console.log('[dashboard] normalized.state', {
      monthTotal: dashboard.monthTotal,
      monthDeltaPct: dashboard.monthDeltaPct,
      yearDeltaPct: dashboard.yearDeltaPct,
      categories: dashboard.categories.length,
      ranking: dashboard.ranking.length,
      alertsCount: dashboard.alertsCount,
    });
  }, [dashboard]);

  return {
    ano,
    mes,
    dashboard,
    loading: query.isLoading && !query.data,
    refreshing: query.isFetching && Boolean(query.data),
    error: query.error ? getApiErrorMessage(query.error, 'Falha ao carregar dashboard.') : null,
    refresh: () => query.refetch({ cancelRefetch: true }),
  };
}
