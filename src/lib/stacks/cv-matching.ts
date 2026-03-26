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
