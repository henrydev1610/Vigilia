import { create } from 'zustand';

export interface ChartPoint {
  key: string;
  label: string;
  value: number;
}

interface AnalyticsState {
  hydrationReady: boolean;
  totalsById: Record<string, number>;
  loadedById: Record<string, true>;
  failedIds: number[];
  totalGeralMes: number;
  yearTotals: number[];
  chartData: ChartPoint[];
  isLoadingTotals: boolean;
  isLoadingChart: boolean;
  monthLoading: boolean;
  chartLoading: boolean;
  progress: string | null;
  setHydrationReady: (value: boolean) => void;
  setTotals: (totalsById: Record<string, number>, failedIds: number[]) => void;
  setLoadedIds: (ids: number[]) => void;
  setTotalGeralMes: (total: number) => void;
  setChartData: (points: ChartPoint[]) => void;
  setYearTotals: (totals: number[]) => void;
  setMonthLoading: (value: boolean) => void;
  setChartLoading: (value: boolean) => void;
  setProgress: (value: string | null) => void;
}

function sumRecord(values: Record<string, number>) {
  return Object.values(values).reduce((acc, current) => acc + Number(current || 0), 0);
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  hydrationReady: false,
  totalsById: {},
  loadedById: {},
  failedIds: [],
  totalGeralMes: 0,
  yearTotals: Array.from({ length: 12 }, () => 0),
  chartData: [],
  isLoadingTotals: false,
  isLoadingChart: false,
  monthLoading: false,
  chartLoading: false,
  progress: null,
  setHydrationReady: (value) => set({ hydrationReady: value }),
  setTotals: (totalsById, failedIds) =>
    set({
      totalsById,
      failedIds,
      totalGeralMes: sumRecord(totalsById),
      loadedById: Object.keys(totalsById).reduce<Record<string, true>>((acc, key) => {
        acc[key] = true;
        return acc;
      }, {}),
    }),
  setLoadedIds: (ids) =>
    set((state) => {
      const next = { ...state.loadedById };
      ids.forEach((id) => {
        next[String(id)] = true;
      });
      return { loadedById: next };
    }),
  setTotalGeralMes: (total) => set({ totalGeralMes: total }),
  setChartData: (points) => set({ chartData: points }),
  setYearTotals: (totals) =>
    set({
      yearTotals: totals.length === 12 ? totals : Array.from({ length: 12 }, (_, index) => Number(totals[index] ?? 0)),
    }),
  setMonthLoading: (value) => set({ monthLoading: value, isLoadingTotals: value }),
  setChartLoading: (value) => set({ chartLoading: value, isLoadingChart: value }),
  setProgress: (value) => set({ progress: value }),
}));
