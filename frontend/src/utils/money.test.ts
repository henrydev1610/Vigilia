import { formatBRL, toNumberBR } from './money';

function assertEqual(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) {
    throw new Error(`${label} failed: expected=${String(expected)} actual=${String(actual)}`);
  }
}

export function runMoneyUnitTests() {
  assertEqual(formatBRL('221815.00'), 'R$ 221.815,00', 'formatBRL decimal-string');
  assertEqual(formatBRL('221.815,00'), 'R$ 221.815,00', 'formatBRL pt-br-string');
  assertEqual(formatBRL(221815), 'R$ 221.815,00', 'formatBRL number');

  assertEqual(toNumberBR('221815.00'), 221815, 'toNumberBR decimal-string');
  assertEqual(toNumberBR('221.815,00'), 221815, 'toNumberBR pt-br-string');
  assertEqual(toNumberBR(221815), 221815, 'toNumberBR number');
}

