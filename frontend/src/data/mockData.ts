export type AlertStatus = 'new_expense' | 'atypical' | 'none';
export type ExpenseCategory =
  | 'ATIVIDADE PARLAMENTAR'
  | 'LOCOMOÇÃO'
  | 'COMUNICAÇÃO'
  | 'INFRAESTRUTURA';

export interface Politician {
  id: string;
  name: string;
  party: string;
  state: string;
  quotaUsed: number;
  quotaLimit: number;
  quotaPercent: number;
  verified?: boolean;
}

export interface RankingItem extends Politician {
  position: number;
  amount: number;
  highlighted?: boolean;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  invoiceNumber?: string;
}

export interface Alert {
  id: string;
  name: string;
  party: string;
  state: string;
  verified?: boolean;
  status: AlertStatus;
}

export const politicians: Politician[] = [
  {
    id: '1',
    name: 'Dep. Joao Silva',
    party: 'PT',
    state: 'SP',
    quotaUsed: 184000,
    quotaLimit: 230000,
    quotaPercent: 80,
    verified: true,
  },
  {
    id: '2',
    name: 'Dep. Maria Costa',
    party: 'PL',
    state: 'RJ',
    quotaUsed: 132000,
    quotaLimit: 230000,
    quotaPercent: 57,
    verified: true,
  },
  {
    id: '3',
    name: 'Dep. Rafael Lima',
    party: 'PSDB',
    state: 'MG',
    quotaUsed: 208000,
    quotaLimit: 230000,
    quotaPercent: 90,
  },
  {
    id: '4',
    name: 'Dep. Fernanda Alves',
    party: 'MDB',
    state: 'BA',
    quotaUsed: 99000,
    quotaLimit: 230000,
    quotaPercent: 43,
    verified: true,
  },
];

export const rankings: RankingItem[] = politicians.map((p, index) => ({
  ...p,
  position: index + 1,
  amount: p.quotaUsed,
  highlighted: index === 0,
}));

export const expenses: Expense[] = [
  {
    id: 'e1',
    date: '12/02/2026',
    description: 'Combustivel para atividades parlamentares',
    category: 'ATIVIDADE PARLAMENTAR',
    amount: 1240.5,
    invoiceNumber: 'NF-92018',
  },
  {
    id: 'e2',
    date: '10/02/2026',
    description: 'Passagem aerea trecho Brasilia-Sao Paulo',
    category: 'LOCOMOÇÃO',
    amount: 2830.0,
    invoiceNumber: 'NF-88412',
  },
  {
    id: 'e3',
    date: '07/02/2026',
    description: 'Servico de comunicacao institucional',
    category: 'COMUNICAÇÃO',
    amount: 4890.55,
    invoiceNumber: 'NF-76321',
  },
  {
    id: 'e4',
    date: '03/02/2026',
    description: 'Manutencao de infraestrutura do gabinete',
    category: 'INFRAESTRUTURA',
    amount: 7132.2,
    invoiceNumber: 'NF-60211',
  },
];

export const alerts: Alert[] = [
  {
    id: 'a1',
    name: 'Dep. Joao Silva',
    party: 'PT',
    state: 'SP',
    verified: true,
    status: 'new_expense',
  },
  {
    id: 'a2',
    name: 'Dep. Maria Costa',
    party: 'PL',
    state: 'RJ',
    status: 'atypical',
  },
  {
    id: 'a3',
    name: 'Dep. Rafael Lima',
    party: 'PSDB',
    state: 'MG',
    status: 'none',
  },
  {
    id: 'a4',
    name: 'Dep. Fernanda Alves',
    party: 'MDB',
    state: 'BA',
    verified: true,
    status: 'new_expense',
  },
];
