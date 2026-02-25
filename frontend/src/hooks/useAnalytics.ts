import { useMemo } from 'react';
import { useMonthlyTotals } from './useMonthlyTotals';

export function useAnalytics(ano: number, mes: number) {
  const monthly = useMonthlyTotals(ano, mes);

  const summary = useMemo(() => ({
    totalGeralMes: monthly.monthTotal,
    progress: monthly.progress,
    failedIds: monthly.failedIds,
    chartPoints: monthly.chartPoints,
    chartLoading: monthly.chartLoading,
  }), [monthly.chartLoading, monthly.chartPoints, monthly.failedIds, monthly.monthTotal, monthly.progress]);

  return {
    ...monthly,
    summary,
  };
}
