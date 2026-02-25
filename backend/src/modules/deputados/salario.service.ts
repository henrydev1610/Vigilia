import { redis } from "../../infra/redis/client";
import { CamaraClient } from "../../infra/http/camara-client";

const SALARY_CACHE_KEY = "cache:camara:deputado:salario-atual";
const ONE_DAY_SECONDS = 60 * 60 * 24;

export class SalarioService {
  private readonly camaraClient = new CamaraClient();

  async getCurrentSalary(): Promise<number | null> {
    const cached = await redis.get(SALARY_CACHE_KEY);
    if (cached) {
      const parsed = Number(cached);
      return Number.isNaN(parsed) ? null : parsed;
    }

    try {
      const value = await this.camaraClient.getDeputySalaryFromPortal();
      if (value !== null) {
        await redis.set(SALARY_CACHE_KEY, String(value), "EX", ONE_DAY_SECONDS);
      }
      return value;
    } catch {
      return null;
    }
  }
}
