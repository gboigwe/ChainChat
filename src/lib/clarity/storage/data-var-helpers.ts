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
/** Atomic update: get current value, apply fn, set result */
export function atomicUpdate<T>(dataVar: DataVar<T>, fn: (current: T) => T): T {
  const updated = fn(dataVar.get());
  dataVar.set(updated);
  return updated;
}
/** Increment a numeric data-var by delta */
export function incrementVar(dataVar: DataVar<bigint>, delta = 1n): bigint {
  return atomicUpdate(dataVar, v => v + delta);
}
/** Decrement a numeric data-var by delta */
export function decrementVar(dataVar: DataVar<bigint>, delta = 1n): bigint {
  return atomicUpdate(dataVar, v => (v >= delta ? v - delta : 0n));
}
/** Compare data-var to expected value */
export function compareVar<T>(dataVar: DataVar<T>, expected: T): boolean {
  return dataVar.get() === expected;
}
/** Reset data-var to initial value */
export function resetVar<T>(dataVar: DataVar<T>, initial: T): void {
  dataVar.set(initial);
}
/** Swap data-var value, return old value */
export function swapVar<T>(dataVar: DataVar<T>, newValue: T): T {
  const old = dataVar.get();
  dataVar.set(newValue);
  return old;
}
/** Global message counter data-var */
export const messageCounter = createDataVar<bigint>(0n);
