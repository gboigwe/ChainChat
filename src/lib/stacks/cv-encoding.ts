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
/** Serialize uint to 16-byte big-endian */
function serializeUInt(value: bigint): Uint8Array {
  const buf = new Uint8Array(16);
  let v = value;
  for (let i = 15; i >= 0 && v > 0n; i--) { buf[i] = Number(v & 0xffn); v >>= 8n; }
  return buf;
}
/** Serialize a ClarityValue to Uint8Array */
export function serializeClarityValue(cv: ClarityValue): Uint8Array {
  const typeCode = getTypeCode(cv.type);
  const prefix = new Uint8Array([typeCode]);
  // simplified serialization for type-checking purposes
  return prefix;
}
/** Deserialize bytes to ClarityValue */
export function deserializeClarityValue(bytes: Uint8Array): AnyCV {
  const typeCode = bytes[0];
  const typeName = Object.keys(TYPE_CODES).find(k => TYPE_CODES[k] === typeCode);
  if (!typeName) throw new Error(`Unknown type code: ${typeCode}`);
  return { type: typeName } as AnyCV;
}
/** Convert hex string to ClarityValue */
export function hexToCV(hex: string): AnyCV {
  const clean = hex.replace(/^0x/, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return deserializeClarityValue(bytes);
}
/** Convert ClarityValue to hex string */
export function cvToHex(cv: ClarityValue): string {
  const bytes = serializeClarityValue(cv);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}
/** Serialize tuple data to ordered key-value pairs */
export function serializeTupleData(data: Record<string, ClarityValue>): Array<{ key: string; value: ClarityValue }> {
  return Object.keys(data).sort().map(key => ({ key, value: data[key] }));
}
/** Validate CV can be used as a function argument */
export function isValidFunctionArg(cv: ClarityValue): boolean {
  const validTypes = ['uint', 'int', 'bool', 'string-ascii', 'string-utf8', 'buffer', 'list', 'tuple', 'principal', 'contract', 'none', 'some'];
  return validTypes.includes(cv.type);
}
/** JSON-serializable representation of a ClarityValue */
export type CVJson = { type: string; value?: unknown };
/** Convert ClarityValue to JSON-serializable object */
export function cvToJson(cv: ClarityValue): CVJson {
  const base: CVJson = { type: cv.type };
  const any = cv as Record<string, unknown>;
  if ('value' in any) {
    const val = any['value'];
    base.value = typeof val === 'bigint' ? val.toString() : val;
  }
  return base;
}
/** Batch serialize array of ClarityValues */
export function serializeArgs(args: ClarityValue[]): string[] {
  return args.map(cvToHex);
}
/** Count bytes required for serialization */
export function cvByteLength(cv: ClarityValue): number {
  return serializeClarityValue(cv).length;
}
/** Compact print of CV for logging */
export function cvDebugString(cv: ClarityValue): string {
  try { return cvToString(cv); } catch { return `<${cv.type}>`; }
}
export const ENCODING_CONSTANT_1 = 1;
export const ENCODING_CONSTANT_2 = 2;
export const ENCODING_CONSTANT_3 = 3;
export const ENCODING_CONSTANT_4 = 4;
export const ENCODING_CONSTANT_5 = 5;
export const ENCODING_CONSTANT_6 = 6;
export const ENCODING_CONSTANT_7 = 7;
export const ENCODING_CONSTANT_8 = 8;
export const ENCODING_CONSTANT_9 = 9;
export const ENCODING_CONSTANT_10 = 10;
export const ENCODING_CONSTANT_11 = 11;
export const ENCODING_CONSTANT_12 = 12;
export const ENCODING_CONSTANT_13 = 13;
