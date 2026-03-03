import { DashboardData } from '../types/dashboard';

export const dashboardSeed: DashboardData = {
  monthTotal: 0,
  monthDeltaPct: 0,
  topSpender: {
    name: 'Sem dados',
    amountLabel: 'R$ 0,00',
  },
  yearDeltaPct: 0,
  categories: [
    {
      name: 'Combustível',
      valueLabel: 'R$ 0,00',
      progress: 0,
    },
    {
      name: 'Passagens Aéreas',
      valueLabel: 'R$ 0,00',
      progress: 0,
    },
    {
      name: 'Manutenção Gabinete',
      valueLabel: 'R$ 0,00',
      progress: 0,
    },
    {
      name: 'Divulgação',
      valueLabel: 'R$ 0,00',
      progress: 0,
    },
  ],
  rankingTotalLabel: 'R$ 0,00',
  ranking: [],
  alertsCount: 0,
};
