import { toNumberBR } from './money';
import { safeString } from './safe';

export function stableHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export function stableKeyFromDeputado(deputado: any): string {
  const direct = deputado?.id ?? deputado?.deputadoId ?? deputado?.codigo ?? deputado?.externalId;
  if (direct !== undefined && direct !== null && String(direct).trim()) {
    return `dep-${String(direct).trim()}`;
  }

  const base = [
    safeString(deputado?.nome, 'sem-nome'),
    safeString(deputado?.siglaPartido ?? deputado?.partido, 'sem-partido'),
    safeString(deputado?.siglaUf ?? deputado?.uf, 'sem-uf'),
    safeString(deputado?.urlFoto ?? deputado?.fotoUrl, 'sem-foto'),
  ].join('|');

  return `dep-${stableHash(base)}`;
}

export function stableKeyFromDespesa(
  despesa: any,
  ctx?: { deputadoId?: string | number; ano?: string | number; mes?: string | number },
): string {
  const deputadoId = safeString(ctx?.deputadoId ?? despesa?.deputadoId ?? despesa?.deputyId, 'sem-deputado');
  const ano = safeString(ctx?.ano ?? despesa?.ano, 'sem-ano');
  const mes = safeString(ctx?.mes ?? despesa?.mes, 'sem-mes');
  const candidateId = despesa?.id ?? despesa?.documentId ?? despesa?.numDocumento ?? despesa?.dataDocumento ?? despesa?.data;
  const fornecedor = safeString(despesa?.nomeFornecedor ?? despesa?.fornecedor, 'sem-fornecedor');
  const tipo = safeString(despesa?.tipoDespesa ?? despesa?.tipo, 'sem-tipo');
  const valor = toNumberBR(despesa?.valorLiquido ?? despesa?.valorDocumento ?? despesa?.valor);

  const base = `${deputadoId}-${ano}-${mes}-${safeString(candidateId, 'sem-id')}-${valor}-${tipo}-${fornecedor}`;
  return `desp-${stableHash(base)}`;
}

export function dedupeByKey<T>(items: T[], keyFn: (item: T) => string): T[] {
  const map = new Map<string, T>();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!map.has(key)) {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
}

export function mergeUniqueById<T>(prev: T[], next: T[], keyFn: (item: T) => string): T[] {
  const map = new Map<string, T>();
  prev.forEach((item) => {
    map.set(keyFn(item), item);
  });
  next.forEach((item) => {
    map.set(keyFn(item), item);
  });
  return Array.from(map.values());
}
