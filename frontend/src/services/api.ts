import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { globalRequestQueue } from '../api/requestQueue';
import { getRetryDelayMs } from '../api/retryPolicy';
import { stableHash } from '../utils/stableHash';
import {
  clearDevApiUrlOverride as clearDevApiUrlOverrideConfig,
  getApiExampleUrl as getApiExampleUrlConfig,
  getCachedApiUrlResolution,
  resolveApiUrl,
  saveDevApiUrlOverride as saveDevApiUrlOverrideConfig,
} from '../config/apiUrl';
import { HealthResponse } from '../types/api';
import type { ApiUrlSource } from '../config/apiUrl';

const REQUEST_TIMEOUT_MS = 15000;
const HEALTH_CHECK_TIMEOUT_MS = 6000;
export type { ApiUrlSource } from '../config/apiUrl';

export interface ApiResolution {
  baseUrl: string | null;
  source: ApiUrlSource;
  envUrl: string | null;
  overrideUrl: string | null;
  message: string | null;
}

export interface ApiRequestErrorDetails {
  kind: 'config' | 'network' | 'http' | 'unknown';
  status?: number;
  message: string;
  code?: string;
}

export class ApiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiConfigurationError';
  }
}

interface AuthInterceptorConfig {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  refreshTokens: (refreshToken: string) => Promise<string | null>;
  handleAuthFailure: () => void;
}

let authConfig: AuthInterceptorConfig | null = null;
let refreshPromise: Promise<string | null> | null = null;
let lastLoggedBaseUrl: string | null = null;
const endpointCounters = new Map<string, number>();
const screenDiagnosticsLogged = new Set<string>();

const MAX_RATE_LIMIT_RETRIES = 3;
const MAX_RATE_LIMIT_BACKOFF_MS = 30000;

interface RateLimitState {
  until: number;
  reason: string | null;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const inFlightGetRequests = new Map<string, Promise<AxiosResponse>>();
let rateLimitState: RateLimitState = {
  until: 0,
  reason: null,
};
const rateLimitListeners = new Set<(state: RateLimitState) => void>();

function notifyRateLimitState() {
  rateLimitListeners.forEach((listener) => listener(rateLimitState));
}

function updateRateLimitState(next: RateLimitState) {
  rateLimitState = next;
  notifyRateLimitState();
}

function markRateLimited(delayMs: number, reason?: string) {
  const jitter = Math.floor(Math.random() * 350);
  const boundedDelay = Math.min(Math.max(1000, delayMs + jitter), MAX_RATE_LIMIT_BACKOFF_MS);
  const nextUntil = Date.now() + boundedDelay;

  if (nextUntil > rateLimitState.until) {
    updateRateLimitState({
      until: nextUntil,
      reason: reason ?? 'Servidor ocupado',
    });
  }
}

function clearRateLimitedIfExpired() {
  if (rateLimitState.until > 0 && Date.now() >= rateLimitState.until) {
    updateRateLimitState({
      until: 0,
      reason: null,
    });
  }
}

function isEssentialEndpoint(url?: string) {
  const endpoint = normalizeEndpointKey(url);
  return (
    endpoint.includes('/health')
    || endpoint.includes('/auth/me')
    || endpoint.includes('/api/users/me')
    || endpoint.includes('/auth/refresh')
    || endpoint.includes('/auth/login')
    || endpoint.includes('/auth/register')
  );
}

function buildInFlightKey(config: AxiosRequestConfig) {
  const method = String(config.method || 'get').toLowerCase();
  const baseURL = String(config.baseURL || api.defaults.baseURL || '');
  const url = String(config.url || '');
  const params = stableHash(config.params);
  const data = stableHash(config.data);
  return `${method}:${baseURL}:${url}:${params}:${data}`;
}

function isRateLimitError(error: AxiosError) {
  const status = error.response?.status;
  if (status === 429 || status === 229) {
    return true;
  }
  const payload = error.response?.data as { message?: unknown; error?: unknown } | undefined;
  const message =
    (typeof payload?.message === 'string' && payload.message) ||
    (typeof payload?.error === 'string' && payload.error) ||
    error.message ||
    '';
  return /rate\\s*limit|too\\s*many\\s*requests/i.test(message);
}

function buildHealthUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, '')}/health`;
}

function normalizeEndpointKey(url?: string) {
  if (!url) return 'unknown';
  const noQuery = url.split('?')[0] || '';
  return noQuery.replace(/https?:\/\/[^/]+/i, '') || '/';
}

function logEndpointCount(config: InternalAxiosRequestConfig) {
  if (!__DEV__) return;
  const method = (config.method || 'get').toUpperCase();
  const endpoint = normalizeEndpointKey(config.url);
  const key = `${method} ${endpoint}`;
  const nextCount = (endpointCounters.get(key) ?? 0) + 1;
  endpointCounters.set(key, nextCount);
  if (nextCount === 1 || nextCount % 25 === 0) {
    // eslint-disable-next-line no-console
    console.log(`[api:count] ${key} -> ${nextCount}`);
  }
}

async function validateHealth(baseUrl: string) {
  try {
    await axios.get<HealthResponse>(buildHealthUrl(baseUrl), {
      timeout: HEALTH_CHECK_TIMEOUT_MS,
    });
    return true;
  } catch {
    return false;
  }
}

export async function resolveApiBaseUrl(): Promise<ApiResolution> {
  let resolution = await resolveApiUrl();

  if (__DEV__ && resolution.source === 'override' && resolution.url) {
    const overrideIsReachable = await validateHealth(resolution.url);
    if (!overrideIsReachable) {
      await clearDevApiUrlOverrideConfig();
      resolution = await resolveApiUrl();
    }
  }

  const mapped: ApiResolution = {
    baseUrl: resolution.url,
    source: resolution.source,
    envUrl: resolution.envUrl,
    overrideUrl: resolution.overrideUrl,
    message: resolution.message,
  };

  if (mapped.baseUrl && api.defaults.baseURL !== mapped.baseUrl) {
    api.defaults.baseURL = mapped.baseUrl;
  }

  if (__DEV__ && mapped.baseUrl && mapped.baseUrl !== lastLoggedBaseUrl) {
    // eslint-disable-next-line no-console
    console.log(`[api] baseURL=${mapped.baseUrl} (source=${mapped.source})`);
    lastLoggedBaseUrl = mapped.baseUrl;
  }

  return mapped;
}

export async function saveDevApiUrlOverride(raw: string) {
  return saveDevApiUrlOverrideConfig(raw);
}

export async function clearDevApiUrlOverride() {
  return clearDevApiUrlOverrideConfig();
}

export const api = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

function applyAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', `Bearer ${token}`);
    return;
  }

  (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
}

api.interceptors.request.use((config) => {
  const token = authConfig?.getAccessToken();
  if (token) {
    applyAuthHeader(config, token);
  }
  logEndpointCount(config);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
      _rateLimitRetryCount?: number;
    }) | undefined;
    const status = error.response?.status;

    if (originalRequest && isRateLimitError(error)) {
      const retryAfterHeader = error.response?.headers?.['retry-after'];
      const baseDelay = getRetryDelayMs({
        attempt: originalRequest._rateLimitRetryCount ?? 0,
        retryAfterHeader: retryAfterHeader as string | number | null | undefined,
        maxDelayMs: MAX_RATE_LIMIT_BACKOFF_MS,
      });
      markRateLimited(baseDelay, 'Servidor ocupado');

      const retryCount = originalRequest._rateLimitRetryCount ?? 0;
      const method = String(originalRequest.method || 'get').toLowerCase();
      const canRetrySafely = method === 'get' || method === 'head';

      if (retryCount < MAX_RATE_LIMIT_RETRIES && canRetrySafely) {
        originalRequest._rateLimitRetryCount = retryCount + 1;
        const delay = getRetryDelayMs({
          attempt: retryCount,
          retryAfterHeader: retryAfterHeader as string | number | null | undefined,
          maxDelayMs: MAX_RATE_LIMIT_BACKOFF_MS,
        });
        await sleep(delay);
        return api(originalRequest);
      }
    }

    if (!authConfig || status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    const refreshToken = authConfig.getRefreshToken();
    if (!refreshToken) {
      authConfig.handleAuthFailure();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = authConfig.refreshTokens(refreshToken).finally(() => {
        refreshPromise = null;
      });
    }

    const nextAccessToken = await refreshPromise;

    if (!nextAccessToken) {
      authConfig.handleAuthFailure();
      return Promise.reject(error);
    }

    applyAuthHeader(originalRequest, nextAccessToken);
    return api(originalRequest);
  },
);

export function configureApiAuth(config: AuthInterceptorConfig) {
  authConfig = config;
}

const rawRequest = api.request.bind(api);
api.request = function wrappedApiRequest<T = unknown, R = AxiosResponse<T>, D = unknown>(
  config: AxiosRequestConfig<D>,
): Promise<R> {
  clearRateLimitedIfExpired();

  const method = String(config.method || 'get').toLowerCase();
  const isGetLike = method === 'get' || method === 'head';
  const endpoint = normalizeEndpointKey(config.url);
  const blockedByRateLimit = rateLimitState.until > Date.now() && !isEssentialEndpoint(endpoint);

  if (blockedByRateLimit) {
    const waitSeconds = Math.max(1, Math.ceil((rateLimitState.until - Date.now()) / 1000));
    const response: AxiosResponse = {
      data: {
        message: `Servidor ocupado. Tentando novamente em ${waitSeconds}s.`,
      },
      status: 429,
      statusText: 'Too Many Requests',
      headers: {
        'retry-after': String(waitSeconds),
      },
      config: config as InternalAxiosRequestConfig,
    };
    return Promise.reject(
      new AxiosError(
        `Servidor ocupado. Tentando novamente em ${waitSeconds}s.`,
        'ERR_RATE_LIMITED',
        config as InternalAxiosRequestConfig,
        undefined,
        response,
      ),
    );
  }

  const execute = () => rawRequest<T, R, D>(config);

  if (!isGetLike) {
    return globalRequestQueue.enqueue(execute);
  }

  const inFlightKey = buildInFlightKey(config);
  const existingPromise = inFlightGetRequests.get(inFlightKey) as Promise<R> | undefined;
  if (existingPromise) {
    return existingPromise;
  }

  const queuedPromise = globalRequestQueue.enqueue(execute)
    .finally(() => {
      inFlightGetRequests.delete(inFlightKey);
    });

  inFlightGetRequests.set(inFlightKey, queuedPromise as unknown as Promise<AxiosResponse>);
  return queuedPromise;
};

function extractErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    const payload = data as { message?: unknown; error?: unknown };
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
  }
  return fallback;
}

export function getApiRequestErrorDetails(error: unknown): ApiRequestErrorDetails {
  if (error instanceof ApiConfigurationError) {
    return {
      kind: 'config',
      message: error.message,
    };
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status) {
      return {
        kind: 'http',
        status,
        code: error.code,
        message: extractErrorMessage(error.response?.data, error.message || `HTTP ${status}`),
      };
    }

    return {
      kind: 'network',
      code: error.code,
      message: error.message || 'Falha de rede ao acessar a API.',
    };
  }

  if (error instanceof Error) {
    return {
      kind: 'unknown',
      message: error.message,
    };
  }

  return {
    kind: 'unknown',
    message: 'Erro desconhecido ao acessar a API.',
  };
}

export async function pingHealth() {
  if (!api.defaults.baseURL) {
    const resolution = await resolveApiBaseUrl();
    if (!resolution.baseUrl) {
      throw new ApiConfigurationError(
        resolution.message ?? 'EXPO_PUBLIC_API_URL nao definido. Configure no .env.',
      );
    }
  }

  const baseUrl = api.defaults.baseURL;
  if (!baseUrl) {
    throw new ApiConfigurationError('Base URL da API nao resolvida para verificar /health.');
  }
  const healthUrl = buildHealthUrl(baseUrl);
  const response = await axios.get<HealthResponse>(healthUrl, {
    timeout: HEALTH_CHECK_TIMEOUT_MS,
  });
  return response.data;
}

export function getApiResolution() {
  const resolution = getCachedApiUrlResolution();
  return {
    baseUrl: resolution.url,
    source: resolution.source,
    envUrl: resolution.envUrl,
    overrideUrl: resolution.overrideUrl,
    message: resolution.message,
  };
}

export function getCurrentApiBaseUrl() {
  return getCachedApiUrlResolution().url;
}

export function getApiExampleUrl() {
  return getApiExampleUrlConfig();
}

export function getApiRequestCounters() {
  return Array.from(endpointCounters.entries())
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count);
}

export function getRateLimitSnapshot() {
  clearRateLimitedIfExpired();
  const remainingMs = Math.max(0, rateLimitState.until - Date.now());
  return {
    isLimited: remainingMs > 0,
    remainingMs,
    retryAt: rateLimitState.until || null,
    reason: rateLimitState.reason,
  };
}

export function subscribeRateLimit(
  listener: (state: { isLimited: boolean; remainingMs: number; retryAt: number | null; reason: string | null }) => void,
) {
  const wrapped = () => {
    listener(getRateLimitSnapshot());
  };
  const internal = () => wrapped();
  rateLimitListeners.add(internal);
  wrapped();

  return () => {
    rateLimitListeners.delete(internal);
  };
}

export async function logApiDiagnosticsOnce(screenName: string) {
  if (!__DEV__ || screenDiagnosticsLogged.has(screenName)) {
    return;
  }

  screenDiagnosticsLogged.add(screenName);
  try {
    const resolution = await resolveApiBaseUrl();
    const tokenPresent = Boolean(authConfig?.getAccessToken?.());
    let healthStatus = 'not-configured';

    if (resolution.baseUrl) {
      try {
        const healthUrl = buildHealthUrl(resolution.baseUrl);
        await axios.get<HealthResponse>(healthUrl, { timeout: HEALTH_CHECK_TIMEOUT_MS });
        healthStatus = 'ok';
      } catch (error) {
        const apiError = getApiRequestErrorDetails(error);
        healthStatus = `${apiError.kind}${apiError.status ? `:${apiError.status}` : ''}`;
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      `[api:diag] screen=${screenName} base=${resolution.baseUrl ?? 'null'} source=${resolution.source} token=${tokenPresent ? 'present' : 'missing'} health=${healthStatus}`,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`[api:diag] screen=${screenName} failed=${error instanceof Error ? error.message : String(error)}`);
  }
}

export function toAbsoluteUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const base = getCurrentApiBaseUrl();
  if (!base) {
    return null;
  }
  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}
