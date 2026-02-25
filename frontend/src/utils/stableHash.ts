export function stableHash(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const valueType = typeof value;
  if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableHash(item)).join(',')}]`;
  }

  if (valueType === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys.map((key) => `${key}:${stableHash(record[key])}`).join(',')}}`;
  }

  return '';
}
