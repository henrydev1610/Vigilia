import { redis } from "../../infra/redis/client";
import { CamaraClient } from "../../infra/http/camara-client";

const SALARY_CACHE_KEY = "cache:camara:deputado:salario-atual";
const ONE_DAY_SECONDS = 60 * 60 * 24;

export class SalarioService {
  private readonly camaraClient = new CamaraClient();

  async getCurrentSalary(): Promise<number | null> {
    try {
      const cached = await redis.get(SALARY_CACHE_KEY);
      if (cached) {
        const parsed = Number(cached);
        return Number.isNaN(parsed) ? null : parsed;
      }
    } catch (error) {
      console.warn("[deputados] salary cache read failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    }

    try {
      const value = await this.camaraClient.getDeputySalaryFromPortal();
      if (value !== null) {
        try {
          await redis.set(SALARY_CACHE_KEY, String(value), "EX", ONE_DAY_SECONDS);
        } catch (error) {
          console.warn("[deputados] salary cache write failed", {
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
      return value;
    } catch {
      return null;
    }
  }
}
