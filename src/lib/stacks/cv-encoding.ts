// ClarityValue serialization and deserialization
import type { ClarityValue, AnyCV } from './clarity-values';
/** Convert ClarityValue to string representation */
export function cvToString(cv: ClarityValue): string {
  switch (cv.type) {
    case 'uint': return `u${(cv as any).value}`;
    case 'int': return `${(cv as any).value}`;
    case 'bool': return String((cv as any).value);
    case 'string-ascii': return `"${(cv as any).value}"`;
    case 'string-utf8': return `u"${(cv as any).value}"`;
    case 'none': return 'none';
    case 'some': return `(some ${cvToString((cv as any).value)})`;
    case 'ok': return `(ok ${cvToString((cv as any).value)})`;
    case 'err': return `(err ${cvToString((cv as any).value)})`;
    default: return JSON.stringify(cv);
  }
}
/** ClarityValue type code map */
const TYPE_CODES: Record<string, number> = {
  'int': 0,
  'uint': 1,
  'buffer': 2,
  'bool': 3,
  'principal': 5,
  'contract': 6,
  'ok': 7,
  'err': 8,
  'none': 9,
  'some': 10,
  'list': 11,
  'tuple': 12,
  'string-ascii': 13,
  'string-utf8': 14,
};
/** Get numeric type code for a ClarityValue type string */
export function getTypeCode(type: string): number {
  const code = TYPE_CODES[type];
  if (code === undefined) throw new Error(`Unknown CV type: ${type}`);
  return code;
}
