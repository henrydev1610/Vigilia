import { AxiosRequestConfig } from 'axios';
import { stableHash } from '../utils/stableHash';
import {
  api,
  clearDevApiUrlOverride,
  configureApiAuth,
  getApiRequestCounters,
  getApiResolution,
  getCurrentApiBaseUrl,
  getRateLimitSnapshot,
  logApiDiagnosticsOnce,
  pingHealth,
  resolveApiBaseUrl,
  saveDevApiUrlOverride,
  subscribeRateLimit,
} from '../services/api';

const inFlightMap = new Map<string, Promise<unknown>>();

function normalizeUrl(url?: string) {
  if (!url) return '/';
  return url.split('?')[0] || '/';
}

function buildRequestKey(config: AxiosRequestConfig) {
  const method = String(config.method || 'get').toLowerCase();
  const normalizedUrl = normalizeUrl(String(config.url || ''));
  const paramsHash = stableHash(config.params);
  const bodyHash = stableHash(config.data);
  const authHeader =
    (config.headers as Record<string, string> | undefined)?.Authorization
    || (config.headers as Record<string, string> | undefined)?.authorization;
  const authScope = authHeader ? 'auth' : 'public';
  return `${method}:${normalizedUrl}:${paramsHash}:${bodyHash}:${authScope}`;
}

async function runRequest<T = any>(config: AxiosRequestConfig) {
  const response = await api.request<T>(config);
  return response;
}

async function request<T = any>(config: AxiosRequestConfig) {
  const method = String(config.method || 'get').toLowerCase();
  const isDedupeEligible = method === 'get' || method === 'head';
  if (!isDedupeEligible) {
    return runRequest<T>(config);
  }

  const requestKey = buildRequestKey(config);
  const inFlight = inFlightMap.get(requestKey) as Promise<Awaited<ReturnType<typeof runRequest<T>>>> | undefined;
  if (inFlight) {
    return inFlight;
  }

  const next = runRequest<T>(config).finally(() => {
    inFlightMap.delete(requestKey);
  });
  inFlightMap.set(requestKey, next as Promise<unknown>);
  return next;
}

export const apiClient = {
  request,
  get: <T = any>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'get', url }),
  post: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'post', url, data }),
  patch: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'patch', url, data }),
  put: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'put', url, data }),
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => request<T>({ ...config, method: 'delete', url }),
};

export async function apiRequest<T = any>(config: AxiosRequestConfig) {
  const response = await apiClient.request<T>(config);
  return response.data;
}

export {
  clearDevApiUrlOverride,
  configureApiAuth,
  getApiRequestCounters,
  getApiResolution,
  getCurrentApiBaseUrl,
  getRateLimitSnapshot,
  logApiDiagnosticsOnce,
  pingHealth,
  resolveApiBaseUrl,
  saveDevApiUrlOverride,
  subscribeRateLimit,
};
