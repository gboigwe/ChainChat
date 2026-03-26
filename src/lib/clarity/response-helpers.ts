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

/** Map over err value, preserving ok */
export function mapErr<T, E, F>(
  res: ClarityResponse<T, E>,
  fn: (error: E) => F,
): ClarityResponse<T, F> {
  return isErr(res) ? err(fn(res.error)) : res;
}

/** Chain ok responses (flatMap) */
export function andThen<T, U, E>(
  res: ClarityResponse<T, E>,
  fn: (value: T) => ClarityResponse<U, E>,
): ClarityResponse<U, E> {
  return isOk(res) ? fn(res.value) : res;
}

/** Standard Clarity error codes for messaging contract */
export const ERR_NOT_FOUND       = 404n;
export const ERR_UNAUTHORIZED    = 401n;
export const ERR_ALREADY_EXISTS  = 409n;
export const ERR_INVALID_INPUT   = 400n;
export const ERR_CHANNEL_FULL    = 413n;
export const ERR_MESSAGE_TOO_LONG = 414n;

/** Human-readable descriptions for error codes */
export const ERROR_MESSAGES: Record<bigint | number, string> = {
  [Number(ERR_NOT_FOUND)]: 'Resource not found',
  [Number(ERR_UNAUTHORIZED)]: 'Not authorized',
  [Number(ERR_ALREADY_EXISTS)]: 'Already exists',
  [Number(ERR_INVALID_INPUT)]: 'Invalid input',
  [Number(ERR_CHANNEL_FULL)]: 'Channel is full',
  [Number(ERR_MESSAGE_TOO_LONG)]: 'Message too long',
};

/** Convert error code bigint to readable string */
export function getErrorMessage(code: bigint): string {
  return ERROR_MESSAGES[Number(code)] ?? `Unknown error: ${code}`;
}
