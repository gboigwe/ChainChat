// ClarityValue branded types
declare const brand: unique symbol;
export type Branded<T, B> = T & { readonly [brand]: B };
