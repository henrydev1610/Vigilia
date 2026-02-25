import { safeNumber, safeString } from '../utils/safe';
import { Deputy, DeputyExpense, RankingItem } from '../types/api';
import { debugMoneyNormalization, toNumberBR } from '../utils/money';

export interface DeputyViewModel {
  id: number;
  nome: string;
  uf: string;
  partido: string;
  fotoUrl: string | null;
  totalMes: number;
}

export interface ExpenseViewModel {
  id: string;
  tipo: string;
  fornecedor: string;
  data: string;
  valor: number;
  cnpjCpf: string | null;
  pdfUrl: string | null;
  ano: number;
  mes: number;
}

export interface RankingViewModel {
  deputyId: number;
  nome: string;
  partido: string;
  uf: string;
  total: number;
  fotoUrl: string | null;
}

export function mapDeputy(dto: Deputy): DeputyViewModel {
  return {
    id: safeNumber((dto as any).id),
    nome: safeString((dto as any).nome, 'Deputado'),
    uf: safeString((dto as any).siglaUf, '--'),
    partido: safeString((dto as any).siglaPartido, '--'),
    fotoUrl: safeString((dto as any).urlFoto || (dto as any).fotoUrl || '', '') || null,
    totalMes: toNumberBR((dto as any).totalMes ?? 0),
  };
}

export function mapExpense(dto: DeputyExpense): ExpenseViewModel {
  // Monetary API contract (validated in current backend integration):
  // - `valorLiquido`, `valorDocumento`, `total` are decimal values in BRL, not cents.
  // - They may come as number, "221815.00" or "221.815,00" depending on endpoint/source.
  const rawValue = dto.valorLiquido ?? dto.valorDocumento;
  const normalizedValue = toNumberBR(rawValue);
  debugMoneyNormalization('mapExpense.valor', rawValue, normalizedValue);

  const supplierName = safeString(
    dto.nomeFornecedor
      ?? dto.fornecedor
      ?? dto.fornecedorNome
      ?? dto.beneficiario
      ?? dto.favorecido
      ?? dto.razaoSocial
      ?? dto.estabelecimento
      ?? dto.fornecedorDados?.nome
      ?? dto.favorecidoDados?.nome,
    'Fornecedor não informado',
  );

  const fallbackId = `${safeString(dto.dataDocumento, 'sem-data')}-${safeString(supplierName, 'sem-fornecedor')}-${normalizedValue}`;
  return {
    id: safeString(dto.id, fallbackId),
    tipo: safeString(dto.tipoDespesa, 'Despesa'),
    fornecedor: supplierName,
    data: safeString(dto.dataDocumento, '--'),
    valor: normalizedValue,
    cnpjCpf: safeString(dto.cnpjCpfFornecedor, '') || null,
    pdfUrl: safeString(dto.urlDocumento ?? dto.urlNotaFiscal, '') || null,
    ano: safeNumber(dto.ano),
    mes: safeNumber(dto.mes),
  };
}

export function mapRanking(dto: RankingItem): RankingViewModel {
  const normalizedTotal = toNumberBR(dto.total);
  debugMoneyNormalization('mapRanking.total', dto.total, normalizedTotal);

  return {
    deputyId: safeNumber(dto.deputyId ?? dto.deputadoId),
    nome: safeString(dto.nome, 'Deputado'),
    partido: safeString((dto as any).partido ?? (dto as any).siglaPartido, '--'),
    uf: safeString((dto as any).uf ?? (dto as any).siglaUf, '--'),
    total: normalizedTotal,
    fotoUrl: safeString(dto.urlFoto, '') || null,
  };
}
