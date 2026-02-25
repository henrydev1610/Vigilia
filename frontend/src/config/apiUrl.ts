import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEV_API_URL_OVERRIDE_KEY = 'dev_api_base_override';
const LEGACY_DEV_API_URL_OVERRIDE_KEYS = [
  '@vigilia/dev-api-url-override',
  '@vigilia/dev-api-base-override',
  'dev_api_url_override',
];
const EXAMPLE_API_URL = 'http://192.168.18.24:3333';

export type ApiUrlSource = 'env' | 'override' | 'hostUriFallback' | 'none';

export interface ResolvedApiUrl {
  url: string | null;
  source: ApiUrlSource;
  envUrl: string | null;
  overrideUrl: string | null;
  message: string | null;
}

class ApiUrlConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiUrlConfigurationError';
  }
}

let cachedResolution: ResolvedApiUrl = {
  url: null,
  source: 'none',
  envUrl: null,
  overrideUrl: null,
  message: null,
};
let hasResolved = false;

function isLocalhostHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1';
}

function getExpoHostIp() {
  const hostUri =
    (Constants.expoConfig as { hostUri?: unknown } | undefined)?.hostUri ??
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as any)?.manifest?.debuggerHost;

  if (typeof hostUri !== 'string') {
    return null;
  }

  const host = hostUri.split(':')[0]?.trim();
  if (!host || isLocalhostHost(host)) {
    return null;
  }
  return host;
}

function getAutoDevApiUrl() {
  const host = getExpoHostIp();
  if (!host) {
    return null;
  }
  return normalizeApiUrl(`http://${host}:3333`, 'hostUri fallback');
}

function getEnvApiUrlFromExpoConfig() {
  const fromExpoConfig = (Constants.expoConfig?.extra as { apiUrl?: unknown } | undefined)?.apiUrl;
  const fromManifest = (Constants as any)?.manifest?.extra?.apiUrl;
  const raw = fromExpoConfig ?? fromManifest;

  if (typeof raw !== 'string') {
    return '';
  }

  return raw.trim();
}

function normalizeApiUrl(raw: string, sourceName: string) {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new ApiUrlConfigurationError(
      `EXPO_PUBLIC_API_URL nao definido. Configure no .env. Exemplo: ${EXAMPLE_API_URL}`,
    );
  }

  const normalizedInput = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(normalizedInput);
  } catch {
    throw new ApiUrlConfigurationError(`${sourceName} invalido: ${trimmed}`);
  }

  if (Platform.OS !== 'web' && isLocalhostHost(parsed.hostname)) {
    throw new ApiUrlConfigurationError(
      `${sourceName} usando localhost. No celular fisico use http://SEU_IP:3333`,
    );
  }

  return parsed.toString().replace(/\/$/, '');
}

function buildMissingEnvResolution(): ResolvedApiUrl {
  return {
    url: null,
    source: 'none',
    envUrl: null,
    overrideUrl: null,
    message: `EXPO_PUBLIC_API_URL nao definido. Configure no .env. Exemplo: ${EXAMPLE_API_URL}`,
  };
}

export function invalidateResolvedApiUrl() {
  hasResolved = false;
}

async function clearLegacyDevApiUrlOverrides() {
  const keysToRemove = LEGACY_DEV_API_URL_OVERRIDE_KEYS.filter(
    (key) => key !== DEV_API_URL_OVERRIDE_KEY,
  );
  if (keysToRemove.length > 0) {
    await AsyncStorage.multiRemove(keysToRemove);
  }
}

export async function saveDevApiUrlOverride(raw: string) {
  if (!__DEV__) {
    return null;
  }

  const normalized = normalizeApiUrl(raw, 'Override DEV');
  await clearLegacyDevApiUrlOverrides();
  await AsyncStorage.setItem(DEV_API_URL_OVERRIDE_KEY, normalized);
  invalidateResolvedApiUrl();
  return normalized;
}

export async function clearDevApiUrlOverride() {
  if (!__DEV__) {
    return;
  }

  await AsyncStorage.removeItem(DEV_API_URL_OVERRIDE_KEY);
  await clearLegacyDevApiUrlOverrides();
  invalidateResolvedApiUrl();
}

async function readDevApiUrlOverride() {
  if (!__DEV__) {
    return null;
  }

  const primaryRaw = (await AsyncStorage.getItem(DEV_API_URL_OVERRIDE_KEY))?.trim();
  if (primaryRaw) {
    return normalizeApiUrl(primaryRaw, 'Override DEV');
  }

  for (const legacyKey of LEGACY_DEV_API_URL_OVERRIDE_KEYS) {
    if (legacyKey === DEV_API_URL_OVERRIDE_KEY) {
      continue;
    }
    const legacyRaw = (await AsyncStorage.getItem(legacyKey))?.trim();
    if (!legacyRaw) {
      continue;
    }

    const normalized = normalizeApiUrl(legacyRaw, 'Override DEV');
    await AsyncStorage.setItem(DEV_API_URL_OVERRIDE_KEY, normalized);
    await AsyncStorage.removeItem(legacyKey);
    return normalized;
  }
  return null;
}

export async function resolveApiUrl(): Promise<ResolvedApiUrl> {
  if (hasResolved) {
    return cachedResolution;
  }

  const envRaw = getEnvApiUrlFromExpoConfig();

  let envUrl: string | null = null;
  let envError: ApiUrlConfigurationError | null = null;

  if (envRaw) {
    try {
      envUrl = normalizeApiUrl(envRaw, 'EXPO_PUBLIC_API_URL');
    } catch (error) {
      envError = error as ApiUrlConfigurationError;
    }
  }

  let overrideUrl: string | null = null;
  if (__DEV__) {
    try {
      overrideUrl = await readDevApiUrlOverride();
    } catch (error) {
      overrideUrl = null;
      await AsyncStorage.removeItem(DEV_API_URL_OVERRIDE_KEY);
      await clearLegacyDevApiUrlOverrides();
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('[api] override DEV invalido removido', error);
      }
    }
  }

  let autoDevUrl: string | null = null;
  if (__DEV__) {
    try {
      autoDevUrl = getAutoDevApiUrl();
    } catch {
      autoDevUrl = null;
    }
  }

  let selectedEnvUrl = envUrl;
  let source: ApiUrlSource = 'none';
  if (overrideUrl) {
    source = 'override';
  } else if (envUrl) {
    source = 'env';
  } else if (autoDevUrl) {
    selectedEnvUrl = autoDevUrl;
    source = 'hostUriFallback';
  }

  const url = overrideUrl || selectedEnvUrl;

  if (!url) {
    if (envError) {
      cachedResolution = {
        url: null,
        source: 'none',
        envUrl: null,
        overrideUrl,
        message: envError.message,
      };
      hasResolved = true;
      return cachedResolution;
    }

    cachedResolution = buildMissingEnvResolution();
    hasResolved = true;
    return cachedResolution;
  }

  cachedResolution = {
    url,
    source,
    envUrl,
    overrideUrl,
    message: null,
  };
  hasResolved = true;
  return cachedResolution;
}

export function getCachedApiUrlResolution() {
  return cachedResolution;
}

export function getApiExampleUrl() {
  return EXAMPLE_API_URL;
}
