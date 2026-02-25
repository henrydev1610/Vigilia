import { AppError } from "../../shared/errors/app-error";

type HttpRequestOptions = {
  timeoutMs?: number;
  retries?: number;
  retryBaseDelayMs?: number;
};

export class HttpClient {
  async getJson<T>(url: string, options?: HttpRequestOptions): Promise<T> {
    const timeoutMs = options?.timeoutMs ?? 8000;
    const retries = options?.retries ?? 3;
    const baseDelay = options?.retryBaseDelayMs ?? 300;

    let lastError: unknown;

    for (let attempt = 0; attempt < retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new AppError(`Erro HTTP ${response.status} ao consultar servico externo`, 502, "EXTERNAL_HTTP_ERROR");
        }

        const data = (await response.json()) as T;
        return data;
      } catch (error) {
        lastError = error;
        if (attempt < retries - 1) {
          const wait = baseDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, wait));
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new AppError("Falha ao consultar servico externo", 504, "EXTERNAL_TIMEOUT", lastError);
  }

  async getText(url: string, options?: HttpRequestOptions): Promise<string> {
    const timeoutMs = options?.timeoutMs ?? 8000;
    const retries = options?.retries ?? 3;
    const baseDelay = options?.retryBaseDelayMs ?? 300;

    let lastError: unknown;

    for (let attempt = 0; attempt < retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: "GET",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new AppError(`Erro HTTP ${response.status} ao consultar servico externo`, 502, "EXTERNAL_HTTP_ERROR");
        }

        return response.text();
      } catch (error) {
        lastError = error;
        if (attempt < retries - 1) {
          const wait = baseDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, wait));
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new AppError("Falha ao consultar servico externo", 504, "EXTERNAL_TIMEOUT", lastError);
  }
}
