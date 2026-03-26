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
