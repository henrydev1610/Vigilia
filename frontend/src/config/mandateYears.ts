type MandatePeriod = {
  start: number;
  end: number;
};

const FALLBACK_PERIODS: MandatePeriod[] = [
  { start: 2019, end: 2022 },
  { start: 2023, end: 2026 },
];

function toInt(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}

function parsePeriodToken(token: string): MandatePeriod | null {
  const normalized = token.trim();
  if (!normalized) return null;
  const [startRaw, endRaw] = normalized.split("-").map((item) => item.trim());
  const start = toInt(startRaw);
  const end = toInt(endRaw);
  if (!start || !end) return null;
  if (start < 2000 || end > 2100 || end < start) return null;
  return { start, end };
}

function parsePeriodsFromEnv(): MandatePeriod[] {
  const raw = process.env.EXPO_PUBLIC_MANDATE_PERIODS;
  if (!raw || !raw.trim()) return [];
  return raw
    .split(",")
    .map(parsePeriodToken)
    .filter((item: MandatePeriod | null): item is MandatePeriod => Boolean(item));
}

function expandYears(periods: MandatePeriod[]): number[] {
  const years = new Set<number>();
  periods.forEach((period) => {
    for (let year = period.start; year <= period.end; year += 1) {
      years.add(year);
    }
  });
  return Array.from(years).sort((a, b) => b - a);
}

export function getMandateYearsConfig(): number[] {
  const envPeriods = parsePeriodsFromEnv();
  const source = envPeriods.length > 0 ? envPeriods : FALLBACK_PERIODS;
  return expandYears(source);
}

export function getNearestAvailableYear(targetYear: number, availableYears: number[]): number {
  if (availableYears.length === 0) return targetYear;
  if (availableYears.includes(targetYear)) return targetYear;
  return availableYears.reduce((nearest, current) => {
    const currentDistance = Math.abs(current - targetYear);
    const nearestDistance = Math.abs(nearest - targetYear);
    return currentDistance < nearestDistance ? current : nearest;
  }, availableYears[0]);
}
