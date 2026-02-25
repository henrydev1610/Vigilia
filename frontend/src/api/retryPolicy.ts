export interface RetryContext {
  attempt: number;
  retryAfterHeader?: string | number | null;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

const DEFAULT_BASE_DELAY_MS = 1000;
const DEFAULT_MAX_DELAY_MS = 30000;

function parseRetryAfterMs(retryAfterHeader?: string | number | null) {
  if (typeof retryAfterHeader === 'number' && Number.isFinite(retryAfterHeader)) {
    return Math.max(0, retryAfterHeader * 1000);
  }

  if (typeof retryAfterHeader === 'string') {
    const numericSeconds = Number(retryAfterHeader);
    if (Number.isFinite(numericSeconds)) {
      return Math.max(0, numericSeconds * 1000);
    }

    const parsedDate = Date.parse(retryAfterHeader);
    if (Number.isFinite(parsedDate)) {
      return Math.max(0, parsedDate - Date.now());
    }
  }

  return 0;
}

export function getRetryDelayMs(context: RetryContext) {
  const baseDelayMs = context.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const maxDelayMs = context.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  const retryAfterMs = parseRetryAfterMs(context.retryAfterHeader);
  const backoffMs = Math.min(baseDelayMs * 2 ** context.attempt, maxDelayMs);
  const effectiveBase = Math.max(retryAfterMs, backoffMs);
  const jitter = Math.floor(Math.random() * 350);
  return Math.min(effectiveBase + jitter, maxDelayMs);
}
