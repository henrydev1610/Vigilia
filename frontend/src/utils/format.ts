import { formatBRL } from './money';

export const formatCurrencyBRL = (value: unknown): string => {
  return formatBRL(value);
};

export const formatCurrency = formatCurrencyBRL;

export const formatDateBR = (value: string | Date | null | undefined): string => {
  if (!value) return '--';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('pt-BR');
};
