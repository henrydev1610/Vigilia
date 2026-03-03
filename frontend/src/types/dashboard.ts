export interface DashboardTopSpender {
  name: string;
  amountLabel: string;
}

export interface DashboardCategory {
  name: string;
  valueLabel: string;
  progress: number;
}

export interface DashboardStateItem {
  name: string;
  valueLabel: string;
  progress?: number;
}

export interface DashboardRankingItem {
  deputyId: number;
  name: string;
  party: string;
  uf: string;
  valueLabel: string;
  total: number;
  progress: number;
}

export interface DashboardData {
  monthTotal: number;
  monthDeltaPct: number;
  topSpender: DashboardTopSpender;
  yearDeltaPct: number;
  categories: DashboardCategory[];
  ranking: DashboardRankingItem[];
  rankingTotalLabel: string;
  alertsCount: number;
}
