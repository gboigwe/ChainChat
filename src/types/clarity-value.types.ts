// ClarityValue branded types
declare const brand: unique symbol;
export type Branded<T, B> = T & { readonly [brand]: B };
export type UIntBrand = Branded<bigint, 'UInt'>;
export type IntBrand = Branded<bigint, 'Int'>;
export type BoolBrand = Branded<boolean, 'Bool'>;
export type StringAsciiBrand = Branded<string, 'StringAscii'>;
export type StringUtf8Brand = Branded<string, 'StringUtf8'>;
export type BufferBrand = Branded<Uint8Array, 'Buffer'>;
export type ClarityValueType = 'uint' | 'int' | 'bool' | 'string-ascii' | 'string-utf8' | 'buffer' | 'list' | 'tuple' | 'principal' | 'contract' | 'none' | 'some' | 'ok' | 'err';
export interface TypedClarityValue<T extends ClarityValueType, V> {
  type: T;
  value: V;
}
