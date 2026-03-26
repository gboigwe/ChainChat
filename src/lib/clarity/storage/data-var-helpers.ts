// Clarity v4 data-var access pattern helpers
/** Typed data variable wrapper */
export interface DataVar<T> {
  get(): T;
  set(value: T): void;
}
