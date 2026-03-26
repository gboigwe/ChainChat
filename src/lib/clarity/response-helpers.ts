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
