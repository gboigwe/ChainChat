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
