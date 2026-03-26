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
