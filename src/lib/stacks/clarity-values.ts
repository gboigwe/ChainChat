// Stacks.js ClarityValue type system
/** Base clarity value type */
export interface ClarityValue { type: string; }
/** Clarity uint value */
export interface UIntCV extends ClarityValue { type: 'uint'; value: bigint; }
/** Clarity int value */
export interface IntCV extends ClarityValue { type: 'int'; value: bigint; }
/** Clarity bool value */
export interface BoolCV extends ClarityValue { type: 'bool'; value: boolean; }
