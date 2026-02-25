const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactBrlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  compactDisplay: 'short',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const devLogCounter = new Map<string, number>();
const DEV_LOG_LIMIT_PER_SCOPE = 12;

function isDevRuntime() {
  return Boolean((globalThis as { __DEV__?: boolean }).__DEV__);
}

function sanitizeNumericString(value: string) {
  return value.replace(/[^\d.,-]/g, '').trim();
}

function toCanonicalNumberString(value: string) {
  const cleaned = sanitizeNumericString(value);
  if (!cleaned) {
    return '';
  }

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      // pt-BR style with thousands as dot and decimal comma: 221.815,00 -> 221815.00
      return cleaned.replace(/\./g, '').replace(',', '.');
    }
    // en-US style with thousands as comma and decimal dot: 221,815.00 -> 221815.00
    return cleaned.replace(/,/g, '');
  }

  if (lastComma >= 0) {
    // comma-only input: treat comma as decimal separator
    return cleaned.replace(/\./g, '').replace(',', '.');
  }

  // dot-only input or integer
  return cleaned.replace(/,/g, '');
}

export function toNumberBR(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const canonical = toCanonicalNumberString(value);
    if (!canonical) {
      return 0;
    }
    const parsed = Number.parseFloat(canonical);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function formatBRL(value: unknown): string {
  return brlFormatter.format(toNumberBR(value));
}

export function formatCompactBRL(value: unknown): string {
  return compactBrlFormatter.format(toNumberBR(value));
}

export function debugMoneyNormalization(scope: string, rawValue: unknown, normalized: number) {
  if (!isDevRuntime()) {
    return;
  }
  const count = devLogCounter.get(scope) ?? 0;
  if (count >= DEV_LOG_LIMIT_PER_SCOPE) {
    return;
  }
  devLogCounter.set(scope, count + 1);
  // eslint-disable-next-line no-console
  console.log(
    `[money] ${scope} raw=${JSON.stringify(rawValue)} normalized=${normalized} formatted=${formatBRL(normalized)}`,
  );
}
