import { dedupeByKey } from './keys';

export function dedupeStrings(values: string[]) {
  return dedupeByKey(values, (value) => value).sort((a, b) => a.localeCompare(b));
}

export { dedupeByKey };
