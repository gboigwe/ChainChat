// Clarity v4 ok/err response pattern helpers

/** Represents a Clarity (ok value) response */
export interface OkResponse<T> {
  type: 'ok';
  value: T;
}

/** Represents a Clarity (err value) response */
export interface ErrResponse<E> {
  type: 'err';
  error: E;
}

/** Union of ok/err — mirrors Clarity response type */
export type ClarityResponse<T, E = bigint> = OkResponse<T> | ErrResponse<E>;

/** Construct an ok response */
export function ok<T>(value: T): OkResponse<T> {
  return { type: 'ok', value };
}

/** Construct an err response */
export function err<E>(error: E): ErrResponse<E> {
  return { type: 'err', error };
}

/** Type guard: check if response is ok */
export function isOk<T, E>(res: ClarityResponse<T, E>): res is OkResponse<T> {
  return res.type === 'ok';
}

/** Type guard: check if response is err */
export function isErr<T, E>(res: ClarityResponse<T, E>): res is ErrResponse<E> {
  return res.type === 'err';
}

/** Unwrap ok value or throw */
export function unwrap<T, E>(res: ClarityResponse<T, E>): T {
  if (isOk(res)) return res.value;
  throw new Error(`Clarity err response: ${String((res as ErrResponse<E>).error)}`);
}

/** Unwrap ok value with fallback */
export function unwrapOr<T, E>(res: ClarityResponse<T, E>, fallback: T): T {
  return isOk(res) ? res.value : fallback;
}

/** Map over ok value, preserving err */
export function mapOk<T, U, E>(
  res: ClarityResponse<T, E>,
  fn: (value: T) => U,
): ClarityResponse<U, E> {
  return isOk(res) ? ok(fn(res.value)) : res;
}
