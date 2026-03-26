// ClarityValue pattern matching utilities
import type { ClarityValue, AnyCV } from './clarity-values';
import { isUIntCV, isIntCV, isBoolCV, isStringAsciiCV, isNoneCV, isSomeCV, isOkCV, isErrCV, isTupleCV, isListCV, isBufferCV } from './clarity-values';
/** Pattern matcher handlers for each CV type */
export interface CVMatcher<R> {
  uint?: (v: bigint) => R;
  int?: (v: bigint) => R;
  bool?: (v: boolean) => R;
  stringAscii?: (v: string) => R;
  stringUtf8?: (v: string) => R;
  buffer?: (v: Uint8Array) => R;
  list?: (v: ClarityValue[]) => R;
  tuple?: (v: Record<string, ClarityValue>) => R;
  principal?: (v: string) => R;
  contract?: (address: string, name: string) => R;
  none?: () => R;
  some?: (v: ClarityValue) => R;
  ok?: (v: ClarityValue) => R;
  err?: (v: ClarityValue) => R;
  _?: (cv: ClarityValue) => R;
}
/** Match a ClarityValue against handler functions */
export function matchCV<R>(cv: ClarityValue, matcher: CVMatcher<R>): R {
  if (isUIntCV(cv) && matcher.uint) return matcher.uint(cv.value);
  if (isIntCV(cv) && matcher.int) return matcher.int(cv.value);
  if (isBoolCV(cv) && matcher.bool) return matcher.bool(cv.value);
  if (isStringAsciiCV(cv) && matcher.stringAscii) return matcher.stringAscii(cv.value);
  if (isNoneCV(cv) && matcher.none) return matcher.none();
  if (isSomeCV(cv) && matcher.some) return matcher.some(cv.value);
  if (isOkCV(cv) && matcher.ok) return matcher.ok(cv.value);
  if (isErrCV(cv) && matcher.err) return matcher.err(cv.value);
  if (isTupleCV(cv) && matcher.tuple) return matcher.tuple(cv.data);
  if (isListCV(cv) && matcher.list) return matcher.list(cv.list);
  if (matcher._) return matcher._(cv);
  throw new Error(`No handler for CV type: ${cv.type}`);
}
/** Check if CV matches a given type string */
export function isCVType(cv: ClarityValue, type: string): boolean {
  return cv.type === type;
}
/** Narrow CV to specific type or return null */
export function narrowCVType<T extends ClarityValue>(
  cv: ClarityValue,
  guard: (cv: ClarityValue) => cv is T,
): T | null {
  return guard(cv) ? cv : null;
}
/** Extract uint value or null */
export function extractUInt(cv: ClarityValue): bigint | null {
  return isUIntCV(cv) ? cv.value : null;
}
/** Extract bool value or null */
export function extractBool(cv: ClarityValue): boolean | null {
  return isBoolCV(cv) ? cv.value : null;
}
/** Extract string-ascii value or null */
export function extractStringAscii(cv: ClarityValue): string | null {
  return isStringAsciiCV(cv) ? cv.value : null;
}
/** Extract optional inner value or null */
export function extractOptional(cv: ClarityValue): ClarityValue | null {
  if (isSomeCV(cv)) return cv.value;
  if (isNoneCV(cv)) return null;
  return null;
}
/** Extract tuple field by name */
export function extractTupleField(cv: ClarityValue, field: string): ClarityValue | null {
  if (!isTupleCV(cv)) return null;
  return cv.data[field] ?? null;
}
/** Extract list as typed array using a mapper */
export function extractList<T>(cv: ClarityValue, mapper: (item: ClarityValue) => T): T[] | null {
  if (!isListCV(cv)) return null;
  return cv.list.map(mapper);
}
/** Extract buffer as hex string */
export function extractBufferAsHex(cv: ClarityValue): string | null {
  if (!isBufferCV(cv)) return null;
  return Array.from(cv.value).map(b => b.toString(16).padStart(2, '0')).join('');
}
/** Recursively collect all CV types in a value */
export function collectCVTypes(cv: ClarityValue): string[] {
  const types: string[] = [cv.type];
  if (isSomeCV(cv)) types.push(...collectCVTypes(cv.value));
  if (isOkCV(cv)) types.push(...collectCVTypes(cv.value));
  if (isErrCV(cv)) types.push(...collectCVTypes(cv.value));
  if (isListCV(cv)) cv.list.forEach(item => types.push(...collectCVTypes(item)));
  if (isTupleCV(cv)) Object.values(cv.data).forEach(v => types.push(...collectCVTypes(v)));
  return types;
}
/** Deep equality check for two ClarityValues */
export function cvEquals(a: ClarityValue, b: ClarityValue): boolean {
  if (a.type !== b.type) return false;
  return cvToString(a) === cvToString(b);
}

function cvToString(cv: ClarityValue): string {
  return JSON.stringify(cv, (_, v) => typeof v === 'bigint' ? v.toString() : v);
}
/** Helper: check if CV has expected field with type check 1 */
export function hasTupleField1(cv: ClarityValue, field: string): boolean {
  return isTupleCV(cv) && field in cv.data;
}
/** Helper: check if CV has expected field with type check 2 */
export function hasTupleField2(cv: ClarityValue, field: string): boolean {
  return isTupleCV(cv) && field in cv.data;
}
/** Helper: check if CV has expected field with type check 3 */
export function hasTupleField3(cv: ClarityValue, field: string): boolean {
  return isTupleCV(cv) && field in cv.data;
}
/** Helper: check if CV has expected field with type check 4 */
export function hasTupleField4(cv: ClarityValue, field: string): boolean {
  return isTupleCV(cv) && field in cv.data;
}
