export const HOME_CATEGORY_ORDER = [
  'Combustível',
  'Passagens Aéreas',
  'Manutenção Gabinete',
  'Divulgação',
] as const;

type CanonicalCategory = (typeof HOME_CATEGORY_ORDER)[number] | 'Outros';

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

export function canonicalCategoryName(raw: string | null | undefined): CanonicalCategory {
  const normalized = normalizeText(String(raw ?? ''));

  if (normalized.includes('COMBUST')) return 'Combustível';
  if (normalized.includes('PASSAG')) return 'Passagens Aéreas';
  if (normalized.includes('MANUTEN') || normalized.includes('ESCRITORIO') || normalized.includes('GABINETE')) return 'Manutenção Gabinete';
  if (normalized.includes('DIVULG')) return 'Divulgação';
  return 'Outros';
}

export function buildDynamicCategoryBars(
  raw: Array<{ name?: string | null; nome?: string | null; total?: number | string | null; value?: number | string | null }>,
) {
  const grouped = new Map<string, number>();

  raw.forEach((entry) => {
    const rawName = entry?.name ?? entry?.nome ?? '';
    const canonical = canonicalCategoryName(rawName);
    const total = Number(entry?.total ?? entry?.value ?? 0) || 0;
    grouped.set(canonical, (grouped.get(canonical) ?? 0) + total);
  });

  const rows = Array.from(grouped.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const sum = rows.reduce((acc, row) => acc + row.total, 0);
  return rows.map((row) => ({
    name: row.name,
    total: row.total,
    progress: sum > 0 ? Math.max(0, Math.min(1, row.total / sum)) : 0,
  }));
}
