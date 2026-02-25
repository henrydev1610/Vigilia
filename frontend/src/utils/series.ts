import { debugMoneyNormalization, toNumberBR } from './money';
import { safeNumber } from './safe';

export interface MonthlyRawItem {
  ano?: number | string;
  mes?: number | string;
  total?: number | string;
  valor?: number | string;
}

export interface MonthlySeriesPoint {
  year: number;
  month: number;
  total: number;
  key: string;
  label: string;
}

const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function shortMonth(month: number) {
  return MONTH_SHORT[Math.max(1, Math.min(12, month)) - 1];
}

export function normalizeMonthlySeries(rawItems: MonthlyRawItem[], selectedYear: number): MonthlySeriesPoint[] {
  const bucket = new Map<string, MonthlySeriesPoint>();

  rawItems.forEach((raw) => {
    const year = safeNumber(raw.ano, selectedYear);
    const month = safeNumber(raw.mes, 0);
    if (year !== selectedYear || month < 1 || month > 12) {
      return;
    }

    const rawValue = raw.total ?? raw.valor;
    const value = toNumberBR(rawValue);
    debugMoneyNormalization('normalizeMonthlySeries.total', rawValue, value);
    const key = `${year}-${month}`;
    const existing = bucket.get(key);

    if (existing) {
      existing.total += value;
      return;
    }

    bucket.set(key, {
      year,
      month,
      total: value,
      key,
      label: shortMonth(month),
    });
  });

  for (let month = 1; month <= 12; month += 1) {
    const key = `${selectedYear}-${month}`;
    if (!bucket.has(key)) {
      bucket.set(key, {
        year: selectedYear,
        month,
        total: 0,
        key,
        label: shortMonth(month),
      });
    }
  }

  return Array.from(bucket.values()).sort((a, b) => a.month - b.month);
}
