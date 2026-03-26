// Stacks.js ClarityValue type system
/** Base clarity value type */
export interface ClarityValue { type: string; }
/** Clarity uint value */
export interface UIntCV extends ClarityValue { type: 'uint'; value: bigint; }
/** Clarity int value */
export interface IntCV extends ClarityValue { type: 'int'; value: bigint; }
/** Clarity bool value */
export interface BoolCV extends ClarityValue { type: 'bool'; value: boolean; }
/** Clarity string-ascii value */
export interface StringAsciiCV extends ClarityValue { type: 'string-ascii'; value: string; }
/** Clarity string-utf8 value */
export interface StringUtf8CV extends ClarityValue { type: 'string-utf8'; value: string; }
/** Clarity buffer value */
export interface BufferCV extends ClarityValue { type: 'buffer'; value: Uint8Array; }
/** Clarity list value */
export interface ListCV extends ClarityValue { type: 'list'; list: ClarityValue[]; }
/** Clarity tuple value */
export interface TupleCV extends ClarityValue { type: 'tuple'; data: Record<string, ClarityValue>; }
/** Clarity standard principal value */
export interface StandardPrincipalCV extends ClarityValue { type: 'principal'; address: string; }
/** Clarity contract principal value */
export interface ContractPrincipalCV extends ClarityValue { type: 'contract'; address: string; contractName: string; }
/** Clarity none value */
export interface NoneCV extends ClarityValue { type: 'none'; }
/** Clarity some value */
export interface SomeCV extends ClarityValue { type: 'some'; value: ClarityValue; }
/** Clarity ok response */
export interface OkCV extends ClarityValue { type: 'ok'; value: ClarityValue; }
/** Clarity err response */
export interface ErrCV extends ClarityValue { type: 'err'; value: ClarityValue; }
/** Union of all Clarity value types */
export type AnyCV = UIntCV | IntCV | BoolCV | StringAsciiCV | StringUtf8CV | BufferCV | ListCV | TupleCV | StandardPrincipalCV | ContractPrincipalCV | NoneCV | SomeCV | OkCV | ErrCV;
/** Factory: uint */
export function uintCV(value: bigint | number): UIntCV {
  return { type: 'uint', value: BigInt(value) };
}
/** Factory: int */
export function intCV(value: bigint | number): IntCV {
  return { type: 'int', value: BigInt(value) };
}
/** Factory: bool */
export function boolCV(value: boolean): BoolCV {
  return { type: 'bool', value };
}
/** Factory: string-ascii */
export function stringAsciiCV(value: string): StringAsciiCV {
  return { type: 'string-ascii', value };
}
/** Factory: string-utf8 */
export function stringUtf8CV(value: string): StringUtf8CV {
  return { type: 'string-utf8', value };
}
/** Factory: buffer */
export function bufferCV(value: Uint8Array): BufferCV {
  return { type: 'buffer', value };
}
/** Factory: buffer from hex string */
export function bufferCVFromHex(hex: string): BufferCV {
  const clean = hex.replace(/^0x/, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return bufferCV(bytes);
}
/** Factory: list */
export function listCV(list: ClarityValue[]): ListCV {
  return { type: 'list', list };
}
/** Factory: tuple */
export function tupleCV(data: Record<string, ClarityValue>): TupleCV {
  return { type: 'tuple', data };
}
/** Factory: standard principal */
export function standardPrincipalCV(address: string): StandardPrincipalCV {
  return { type: 'principal', address };
}
/** Factory: contract principal */
export function contractPrincipalCV(address: string, contractName: string): ContractPrincipalCV {
  return { type: 'contract', address, contractName };
}
/** Factory: none */
export function noneCV(): NoneCV { return { type: 'none' }; }
/** Factory: some */
export function someCV(value: ClarityValue): SomeCV {
  return { type: 'some', value };
}
/** Factory: ok */
export function okCV(value: ClarityValue): OkCV {
  return { type: 'ok', value };
}
/** Factory: err */
export function errCV(value: ClarityValue): ErrCV {
  return { type: 'err', value };
}
/** Type guard: is UIntCV */
export function isUIntCV(cv: ClarityValue): cv is UIntCV { return cv.type === 'uint'; }
/** Type guard: is IntCV */
export function isIntCV(cv: ClarityValue): cv is IntCV { return cv.type === 'int'; }
/** Type guard: is BoolCV */
export function isBoolCV(cv: ClarityValue): cv is BoolCV { return cv.type === 'bool'; }
/** Type guard: is StringAsciiCV */
export function isStringAsciiCV(cv: ClarityValue): cv is StringAsciiCV { return cv.type === 'string-ascii'; }
/** Type guard: is StringUtf8CV */
export function isStringUtf8CV(cv: ClarityValue): cv is StringUtf8CV { return cv.type === 'string-utf8'; }
/** Type guard: is BufferCV */
export function isBufferCV(cv: ClarityValue): cv is BufferCV { return cv.type === 'buffer'; }
/** Type guard: is ListCV */
export function isListCV(cv: ClarityValue): cv is ListCV { return cv.type === 'list'; }
/** Type guard: is TupleCV */
export function isTupleCV(cv: ClarityValue): cv is TupleCV { return cv.type === 'tuple'; }
