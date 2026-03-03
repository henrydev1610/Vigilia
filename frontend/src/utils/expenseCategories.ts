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
  if (normalized.includes('PASSAG') && normalized.includes('AERE')) return 'Passagens Aéreas';
  if (normalized.includes('MANUTEN') || normalized.includes('ESCRITORIO') || normalized.includes('GABINETE')) return 'Manutenção Gabinete';
  if (normalized.includes('DIVULG')) return 'Divulgação';
  return 'Outros';
}

