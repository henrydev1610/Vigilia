import { DashboardData } from '../types/dashboard';

export const dashboardSeed: DashboardData = {
  monthTotal: 42572400,
  monthDeltaPct: 4.2,
  topSpender: {
    name: 'Dep. João Silva',
    amountLabel: 'R$ 184k',
  },
  yearDeltaPct: 12.4,
  categories: [
    {
      name: 'Combustível',
      valueLabel: 'R$ 12.4M',
      progress: 0.96,
    },
    {
      name: 'Passagens Aéreas',
      valueLabel: 'R$ 8.2M',
      progress: 0.66,
    },
    {
      name: 'Manutenção Gabinete',
      valueLabel: 'R$ 5.1M',
      progress: 0.41,
    },
    {
      name: 'Divulgação',
      valueLabel: 'R$ 3.8M',
      progress: 0.3,
    },
  ],
  statesTotalLabel: 'R$ 29.4M',
  states: [
    {
      name: 'São Paulo',
      valueLabel: 'R$ 8.4M',
      progress: 0.88,
    },
    {
      name: 'Rio de Janeiro',
      valueLabel: 'R$ 6.9M',
      progress: 0.72,
    },
    {
      name: 'Minas Gerais',
      valueLabel: 'R$ 5.7M',
      progress: 0.59,
    },
    {
      name: 'Bahia',
      valueLabel: 'R$ 4.8M',
      progress: 0.5,
    },
    {
      name: 'Distrito Federal',
      valueLabel: 'R$ 3.6M',
      progress: 0.38,
    },
  ],
};
