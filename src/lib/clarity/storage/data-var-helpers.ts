// Clarity v4 data-var access pattern helpers
/** Typed data variable wrapper */
export interface DataVar<T> {
  get(): T;
  set(value: T): void;
}
/** Create an in-memory data-var */
export function createDataVar<T>(initial: T): DataVar<T> {
  let current = initial;
  return {
    get: () => current,
    set: (v: T) => { current = v; },
  };
}
