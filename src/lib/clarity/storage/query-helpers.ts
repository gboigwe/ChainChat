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
