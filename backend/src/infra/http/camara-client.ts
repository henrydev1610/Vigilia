import { env } from "../../config/env";
import { HttpClient } from "./http-client";

export type CamaraListResponse<T> = {
  dados: T[];
  links?: Array<{ rel: string; href: string }>;
};

export type CamaraDeputy = {
  id: number;
  nome: string;
  nomeCivil?: string;
  siglaUf: string;
  siglaPartido: string;
  urlFoto: string;
  uri: string;
  email?: string;
  ultimoStatus?: {
    nome?: string;
    siglaUf?: string;
    siglaPartido?: string;
    urlFoto?: string;
    email?: string;
  };
};

export type CamaraExpense = {
  ano: number;
  mes: number;
  tipoDespesa?: string;
  tipoDocumento?: string;
  dataDocumento?: string;
  numDocumento?: string;
  nomeFornecedor?: string;
  cnpjCpfFornecedor?: string;
  valorDocumento?: number;
  valorGlosa?: number;
  valorLiquido?: number;
  urlDocumento?: string;
};

export type CamaraExpenseType = {
  cod: string | number | null;
  sigla?: string | null;
  nome: string | null;
  descricao?: string | null;
};

export class CamaraClient {
  private readonly httpClient = new HttpClient();

  async listDeputies(page: number, items = 100): Promise<CamaraListResponse<CamaraDeputy>> {
    const url = `${env.CAMARA_BASE_URL}/deputados?itens=${items}&pagina=${page}`;
    return this.httpClient.getJson(url);
  }

  async getDeputyById(id: number): Promise<{ dados: CamaraDeputy }> {
    const url = `${env.CAMARA_BASE_URL}/deputados/${id}`;
    return this.httpClient.getJson(url);
  }

  async listDeputyExpenses(
    deputyId: number,
    ano: number,
    mes: number,
    page: number,
    items = 100
  ): Promise<CamaraListResponse<CamaraExpense>> {
    const url = `${env.CAMARA_BASE_URL}/deputados/${deputyId}/despesas?ano=${ano}&mes=${mes}&itens=${items}&pagina=${page}`;
    return this.httpClient.getJson(url);
  }

  async listExpenseTypes(): Promise<{ dados: CamaraExpenseType[] }> {
    const url = `${env.CAMARA_BASE_URL}/referencias/deputados/tipoDespesa`;
    return this.httpClient.getJson(url);
  }

  async getDeputySalaryFromPortal(): Promise<number | null> {
    const html = await this.httpClient.getText("https://www.camara.leg.br/transparencia/gastos-parlamentares/");
    const normalized = html.replace(/\s+/g, " ");
    const match = normalized.match(/sal[aá]rio atual de um deputado federal [^R]*R\$\s*([0-9\.\,]+)/i);
    if (!match?.[1]) return null;

    const raw = match[1].replace(/\./g, "").replace(",", ".");
    const value = Number(raw);
    if (Number.isNaN(value)) return null;
    return value;
  }
}
