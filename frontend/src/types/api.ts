export interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface HealthResponse {
  status: string;
  uptime?: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export interface UpdateMePayload {
  name?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteMePayload {
  password: string;
}

export interface Deputy {
  id: number;
  nome: string;
  siglaPartido?: string;
  siglaUf?: string;
  urlFoto?: string;
  email?: string;
  idLegislatura?: number;
  uri?: string;
  situacao?: string;
  condicaoEleitoral?: string;
  totalMes?: number | string;
  salario?: number | string;
}

export interface DeputyListResponse {
  data?: Deputy[];
  deputados?: Deputy[];
  items?: Deputy[];
  total?: number;
  pagina?: number;
  meta?: {
    total?: number;
  };
}

export interface ExpenseType {
  id?: number;
  codigo?: number;
  nome?: string;
  descricao?: string;
}

export interface DeputyExpense {
  id?: string | number;
  ano?: number;
  mes?: number;
  tipoDespesa?: string;
  tipoDocumento?: string;
  nomeFornecedor?: string;
  fornecedor?: string;
  fornecedorNome?: string;
  beneficiario?: string;
  favorecido?: string;
  razaoSocial?: string;
  estabelecimento?: string;
  fornecedorDados?: { nome?: string };
  favorecidoDados?: { nome?: string };
  cnpjCpfFornecedor?: string;
  valorDocumento?: number | string;
  valorLiquido?: number | string;
  valorGlosa?: number | string;
  dataDocumento?: string;
  numDocumento?: string;
  urlDocumento?: string;
  urlNotaFiscal?: string;
}

export interface RankingItem {
  deputyId?: number;
  deputadoId?: number;
  nome: string;
  partido?: string;
  uf?: string;
  total: number | string;
  urlFoto?: string;
}

export interface FavoriteItem {
  deputyId?: number;
  deputadoId?: number;
  id?: number | string;
  nome?: string;
  siglaPartido?: string;
  siglaUf?: string;
  urlFoto?: string;
}

export interface PaginatedQuery {
  pagina?: number;
  itens?: number;
  mes?: string;
  ano?: number;
  mesNumero?: number;
  uf?: string;
  partido?: string;
  search?: string;
}

export interface DeputadosResumoMes {
  mes: string;
  ano: number;
  mesNumero: number;
  totalGeralMes: number | string;
  totalsByMonth: Array<{
    mes: number;
    total: number | string;
  }>;
}

export interface DeputadoResumoAnual {
  deputadoId: number;
  ano: number;
  totalsByMonth: Array<{
    mes: number;
    totalMes: number | string;
  }>;
}

export interface DashboardResumoResponse {
  ano: number;
  mes: number;
  totalMesAtual: number;
  totalMesAnterior: number;
  variacaoMensalPct: number;
  variacaoAnualPct: number;
  maiorGasto: {
    deputyId: number;
    nome: string;
    siglaPartido: string;
    siglaUf: string;
    urlFoto: string;
    total: number;
  } | null;
  categorias: Array<{
    nome: string;
    total: number;
    percentual: number;
  }>;
  ranking: Array<{
    deputyId: number;
    nome: string;
    siglaPartido: string;
    siglaUf: string;
    urlFoto: string;
    total: number;
  }>;
  alertsCount: number;
}

export interface MonthExpenseItem {
  id: string;
  deputyId: number;
  deputyName: string;
  siglaPartido: string;
  siglaUf: string;
  dataDocumento: string | null;
  numeroDocumento: string | null;
  fornecedor: string | null;
  valorLiquido: number;
  urlDocumento: string | null;
  categoryLabel: string | null;
}

export interface MonthExpensesResponse {
  data: MonthExpenseItem[];
  meta: {
    ano: number;
    mes: number;
    pagina: number;
    itens: number;
    total: number;
    totalPaginas: number;
    monthTotal: number;
    categories: Array<{
      name: string;
      total: number;
      percent: number;
    }>;
  };
}

