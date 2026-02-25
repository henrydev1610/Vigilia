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

export interface DashboardData {
  monthTotal: number;
  monthDeltaPct: number;
  topSpender: DashboardTopSpender;
  yearDeltaPct: number;
  categories: DashboardCategory[];
  states: DashboardStateItem[];
  statesTotalLabel: string;
}
