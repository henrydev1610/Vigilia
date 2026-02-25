export const CACHE_KEYS = {
  deputadosList: 'cache:deputados:list:v1',
  favoritesList: 'cache:favoritos:list:v1',
  ranking: (mode: string, ano: number, mes: number, limit: number) => `cache:ranking:${mode}:${ano}:${mes}:${limit}`,
  monthlyTotals: (ano: number, mes: number) => `totals:${ano}:${mes}`,
  yearChart: (ano: number) => `chart:${ano}`,
} as const;
