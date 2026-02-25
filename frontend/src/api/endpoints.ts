export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    me: '/auth/me',
    logout: '/auth/logout',
  },
  users: {
    me: '/api/users/me',
  },
  deputados: {
    list: '/api/deputados',
    detail: (id: string | number) => `/api/deputados/${id}`,
    sync: '/api/deputados/sync',
    despesas: (id: string | number) => `/api/deputados/${id}/despesas`,
    resumo: (id: string | number) => `/api/deputados/${id}/resumo`,
    syncDespesas: (id: string | number) => `/api/deputados/${id}/despesas/sync`,
  },
  analytics: {
    deputadoTotaisMes: '/api/analytics/deputados/totais-mes',
    deputadoTotaisMesFallback: '/analytics/deputados/totais-mes',
  },
  ranking: {
    ceap: '/api/ranking/ceap',
    cecap: '/api/ranking/cecap',
  },
  favoritos: {
    list: '/api/favoritos',
    byId: (id: string | number) => `/api/favoritos/${id}`,
  },
  health: '/health',
} as const;
