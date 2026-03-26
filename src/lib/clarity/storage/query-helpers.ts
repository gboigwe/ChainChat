// Query helpers for Clarity storage maps
import { mapValues } from './map-helpers';
/** Sort order type */
export type SortOrder = 'asc' | 'desc';
/** Sort array of objects by bigint field */
export function sortByBigintField<T>(
  items: T[],
  field: keyof T,
  order: SortOrder = 'asc',
): T[] {
  return [...items].sort((a, b) => {
    const va = a[field] as unknown as bigint;
    const vb = b[field] as unknown as bigint;
    return order === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (vb < va ? -1 : vb > va ? 1 : 0);
  });
}
/** Sort array of objects by string field */
export function sortByStringField<T>(
  items: T[],
  field: keyof T,
  order: SortOrder = 'asc',
): T[] {
  return [...items].sort((a, b) => {
    const sa = String(a[field]);
    const sb = String(b[field]);
    return order === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
  });
}
/** Paginate array */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice(page * pageSize, (page + 1) * pageSize);
}
/** Search items by string field containing query */
export function searchByField<T>(
  items: T[],
  field: keyof T,
  query: string,
): T[] {
  const q = query.toLowerCase();
  return items.filter(item => String(item[field]).toLowerCase().includes(q));
}
/** Group array of items by a string field */
export function groupByField<T>(
  items: T[],
  field: keyof T,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = String(item[field]);
    const existing = groups.get(key) ?? [];
    existing.push(item);
    groups.set(key, existing);
  }
  return groups;
}
/** Count items by field value */
export function countByField<T>(items: T[], field: keyof T): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = String(item[field]);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}
/** Get unique values for a field */
export function uniqueByField<T>(items: T[], field: keyof T): T[keyof T][] {
  return [...new Set(items.map(i => i[field]))];
}
/** Sum bigint field across items */
export function sumBigintField<T>(items: T[], field: keyof T): bigint {
  return items.reduce((acc, item) => acc + (item[field] as unknown as bigint), 0n);
}
/** Max bigint field across items */
export function maxBigintField<T>(items: T[], field: keyof T): bigint {
  return items.reduce((max, item) => {
    const v = item[field] as unknown as bigint;
    return v > max ? v : max;
  }, 0n);
}
/** Min bigint field across items */
export function minBigintField<T>(items: T[], field: keyof T): bigint {
  if (items.length === 0) return 0n;
  return items.reduce((min, item) => {
    const v = item[field] as unknown as bigint;
    return v < min ? v : min;
  }, items[0][field] as unknown as bigint);
}
