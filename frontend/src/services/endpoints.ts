import { apiClient as api } from '../api/client';
import {
  AuthTokens,
  ChangePasswordPayload,
  DeleteMePayload,
  Deputy,
  DeputadoResumoAnual,
  DeputadosResumoMes,
  DeputyExpense,
  DeputyListResponse,
  ExpenseType,
  FavoriteItem,
  LoginPayload,
  PaginatedQuery,
  RankingItem,
  RefreshPayload,
  RegisterPayload,
  UpdateMePayload,
  User,
} from '../types/api';

function normalizeUser(payload: any): User {
  const raw = payload?.user ?? payload?.data ?? payload;
  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    name: String(raw?.name ?? raw?.nome ?? ''),
    email: String(raw?.email ?? ''),
  };
}

function extractList<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (Array.isArray(payload?.results)) return payload.results as T[];
  if (Array.isArray(payload?.deputados)) return payload.deputados as T[];
  if (Array.isArray(payload?.favoritos)) return payload.favoritos as T[];
  if (Array.isArray(payload?.despesas)) return payload.despesas as T[];
  if (Array.isArray(payload?.tipos)) return payload.tipos as T[];
  return [];
}

function extractTokens(payload: any): AuthTokens {
  const source = payload?.data ?? payload;
  return {
    accessToken: source?.accessToken,
    refreshToken: source?.refreshToken,
  };
}

function clampLimit(limit?: number, max = 100) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed)) {
    return max;
  }
  return Math.min(Math.max(Math.trunc(parsed), 1), max);
}

function clampPage(page?: number) {
  const parsed = Number(page);
  if (!Number.isFinite(parsed)) {
    return 1;
  }
  return Math.max(Math.trunc(parsed), 1);
}

function clampOffset(offset?: number) {
  const parsed = Number(offset);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(Math.trunc(parsed), 0);
}

interface DeputyMonthlyTotalItem {
  deputadoId?: number | string;
  deputyId?: number | string;
  id?: number | string;
  totalMes?: number | string;
  total?: number | string;
}

export async function registerRequest(input: RegisterPayload) {
  const response = await api.post('/auth/register', input);
  return response.data;
}

export async function loginRequest(input: LoginPayload): Promise<AuthTokens> {
  const response = await api.post('/auth/login', input);
  return extractTokens(response.data);
}

export async function refreshRequest(input: RefreshPayload): Promise<AuthTokens> {
  const response = await api.post('/auth/refresh', input);
  const tokens = extractTokens(response.data);
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? input.refreshToken,
  };
}

export async function authMeRequest() {
  const response = await api.get('/auth/me');
  return normalizeUser(response.data);
}

export async function userMeRequest() {
  const response = await api.get('/api/users/me');
  return normalizeUser(response.data);
}

export async function logoutRequest(refreshToken: string) {
  await api.post('/auth/logout', { refreshToken });
}

export async function updateMeRequest(input: UpdateMePayload) {
  const response = await api.patch('/api/users/me', input);
  return normalizeUser(response.data);
}

export async function changePasswordRequest(input: ChangePasswordPayload) {
  await api.patch('/api/users/me/password', input);
}

export async function deleteMeRequest(input: DeleteMePayload) {
  await api.delete('/api/users/me', { data: input });
}

export async function listDeputadosRequest(query: PaginatedQuery): Promise<{ data: Deputy[]; total?: number; meta?: any }> {
  const safeQuery = {
    ...query,
    itens: clampLimit(query.itens, 100),
    pagina: clampPage(query.pagina),
  };
  const response = await api.get<DeputyListResponse>('/api/deputados', { params: safeQuery });
  const data = extractList<Deputy>(response.data);
  return {
    data,
    total: response.data?.total ?? response.data?.meta?.total,
    meta: (response.data as any)?.meta,
  };
}

export async function syncDeputadosMesRequest(params: { ano: number; mes: number; force?: boolean }) {
  const payload = {
    ano: params.ano,
    mes: params.mes,
    force: Boolean(params.force),
  };
  const response = await api.post('/api/sync/deputados/mes', payload);
  return response.data?.data ?? response.data;
}

export async function deputadosResumoMesRequest(mes: string): Promise<DeputadosResumoMes> {
  const response = await api.get('/api/deputados/resumo', { params: { mes } });
  const payload = response.data?.data ?? response.data;
  return payload as DeputadosResumoMes;
}

export async function deputadoDetailRequest(id: number | string): Promise<Deputy> {
  const response = await api.get(`/api/deputados/${id}`);
  const payload = response.data?.data ?? response.data?.deputado ?? response.data;
  return payload as Deputy;
}

export async function syncDeputadosRequest() {
  await api.post('/api/deputados/sync');
}

export async function expenseTypesRequest(): Promise<ExpenseType[]> {
  const response = await api.get('/api/despesas/tipos');
  return extractList<ExpenseType>(response.data);
}

export async function deputyExpensesRequest(
  deputyId: number | string,
  params: { ano?: number; mes?: number; pagina?: number; itens?: number },
): Promise<DeputyExpense[]> {
  // Monetary fields from this endpoint:
  // - valorLiquido / valorDocumento => BRL decimal (number | numeric string), not cents.
  const response = await api.get(`/api/deputados/${deputyId}/despesas`, { params });
  return extractList<DeputyExpense>(response.data);
}

export async function getDeputadoMonthlyTotalRequest(
  deputyId: number | string,
  params: { ano?: number; mes?: number },
): Promise<number | string> {
  const response = await api.get(`/api/deputados/${deputyId}/resumo`, { params });
  const payload = response.data?.data ?? response.data?.resumo ?? response.data;
  return payload?.totalMes ?? payload?.total ?? payload?.valorTotal ?? 0;
}

export async function getDeputadoYearResumoRequest(
  deputyId: number | string,
  params: { ano: number },
): Promise<DeputadoResumoAnual> {
  const response = await api.get(`/api/deputados/${deputyId}/resumo-anual`, { params });
  const payload = response.data?.data ?? response.data;
  return payload as DeputadoResumoAnual;
}

export async function syncDeputyExpensesRequest(deputyId: number | string, params: { ano?: number; mes?: number }) {
  await api.post(`/api/deputados/${deputyId}/despesas/sync`, null, { params });
}

export async function rankingCeapRequest(params: { ano?: number; mes?: number; limit?: number; page?: number }): Promise<RankingItem[]> {
  const safeLimit = clampLimit(params.limit, 100);
  const safePage = clampPage(params.page);
  // Monetary field from this endpoint:
  // - total => BRL decimal (number | numeric string), not cents.
  const response = await api.get('/api/ranking/ceap', {
    params: {
      ...params,
      limit: safeLimit,
      page: safePage,
      pagina: safePage,
    },
  });
  return extractList<RankingItem>(response.data);
}

export async function rankingCecapRequest(params: { ano?: number; mes?: number; limit?: number; page?: number }): Promise<RankingItem[]> {
  const safeLimit = clampLimit(params.limit, 100);
  const safePage = clampPage(params.page);
  // Monetary field from this endpoint:
  // - total => BRL decimal (number | numeric string), not cents.
  const response = await api.get('/api/ranking/cecap', {
    params: {
      ...params,
      limit: safeLimit,
      page: safePage,
      pagina: safePage,
    },
  });
  return extractList<RankingItem>(response.data);
}

export async function listAnalyticsDeputadosTotalsMesRequest(params: {
  ano?: number;
  mes?: number;
  limit?: number;
  offset?: number;
}): Promise<DeputyMonthlyTotalItem[]> {
  const safeLimit = clampLimit(params.limit, 100);
  const safeOffset = clampOffset(params.offset);
  const safePage = Math.floor(safeOffset / safeLimit) + 1;

  const queryParams = {
    ...params,
    limit: safeLimit,
    offset: safeOffset,
    page: safePage,
    pagina: safePage,
  };

  try {
    const response = await api.get('/api/analytics/deputados/totais-mes', { params: queryParams });
    return extractList<DeputyMonthlyTotalItem>(response.data);
  } catch {
    const response = await api.get('/analytics/deputados/totais-mes', { params: queryParams });
    return extractList<DeputyMonthlyTotalItem>(response.data);
  }
}

export async function listFavoritesRequest(): Promise<FavoriteItem[]> {
  const response = await api.get('/api/favoritos');
  return extractList<FavoriteItem>(response.data);
}

export async function addFavoriteRequest(deputyId: number) {
  await api.post('/api/favoritos', { deputyId });
}

export async function removeFavoriteRequest(deputadoId: number) {
  await api.delete(`/api/favoritos/${deputadoId}`);
}


