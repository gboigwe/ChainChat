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
