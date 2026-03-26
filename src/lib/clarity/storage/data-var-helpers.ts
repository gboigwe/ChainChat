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
/** Global channel counter data-var */
export const channelCounter = createDataVar<bigint>(0n);
/** Contract owner data-var */
export const contractOwner = createDataVar<string>('');
/** Is contract paused data-var */
export const contractPaused = createDataVar<boolean>(false);
/** Check if contract operations should be blocked */
export function isContractPaused(): boolean {
  return contractPaused.get();
}
/** Pause the contract */
export function pauseContract(): void {
  contractPaused.set(true);
}
/** Resume contract operations */
export function resumeContract(): void {
  contractPaused.set(false);
}
/** Get and increment message counter atomically */
export function nextMessageId(): bigint {
  return incrementVar(messageCounter);
}
/** Get and increment channel counter atomically */
export function nextChannelId(): bigint {
  return incrementVar(channelCounter);
}
/** Toggle boolean data-var */
export function toggleVar(dataVar: DataVar<boolean>): boolean {
  const next = !dataVar.get();
  dataVar.set(next);
  return next;
}
/** Clamp numeric data-var between min and max */
export function clampVar(
  dataVar: DataVar<bigint>,
  min: bigint,
  max: bigint,
): bigint {
  const v = dataVar.get();
  const clamped = v < min ? min : v > max ? max : v;
  dataVar.set(clamped);
  return clamped;
}
/** Subscribe to changes on a data-var */
export interface DataVarWithSubscription<T> extends DataVar<T> {
  subscribe(listener: (newValue: T, oldValue: T) => void): () => void;
}
/** Create data-var with change notification */
export function createObservableVar<T>(initial: T): DataVarWithSubscription<T> {
  let current = initial;
  const listeners = new Set<(n: T, o: T) => void>();
  return {
    get: () => current,
    set: (v: T) => { const old = current; current = v; listeners.forEach(l => l(v, old)); },
    subscribe: (l) => { listeners.add(l); return () => listeners.delete(l); },
  };
}
/** Fee rate data-var */
export const feeRateVar = createDataVar<bigint>(1000n);
/** Minimum deposit data-var */
export const minDepositVar = createDataVar<bigint>(1_000_000n);
/** Get current fee rate */
export function getFeeRate(): bigint { return feeRateVar.get(); }
/** Update fee rate (owner only) */
export function setFeeRate(rate: bigint): void {
  if (rate <= 0n) throw new Error('Fee rate must be positive');
  feeRateVar.set(rate);
}
/** Maximum message age before archival (data-var) */
export const maxMessageAgeVar = createDataVar<bigint>(50_400n);
/** Get max message age setting */
export function getMaxMessageAge(): bigint { return maxMessageAgeVar.get(); }
/** Treasury balance data-var */
export const treasuryBalance = createDataVar<bigint>(0n);
/** Get treasury balance */
export function getTreasuryBalance(): bigint { return treasuryBalance.get(); }
/** Deposit to treasury */
export function depositToTreasury(amount: bigint): void {
  incrementVar(treasuryBalance, amount);
}
/** Withdraw from treasury */
export function withdrawFromTreasury(amount: bigint): void {
  if (treasuryBalance.get() < amount) throw new Error('Insufficient treasury funds');
  decrementVar(treasuryBalance, amount);
}
/** Channel creation fee (microSTX) */
export const channelCreationFee = createDataVar<bigint>(5_000_000n);
/** Message posting fee (microSTX, 0 = free) */
export const messagePostingFee = createDataVar<bigint>(0n);
/** Get channel creation fee */
export function getChannelCreationFee(): bigint { return channelCreationFee.get(); }
/** Get message posting fee */
export function getMessagePostingFee(): bigint { return messagePostingFee.get(); }
export const maxChannelsPerUserVar = createDataVar<bigint>(0n);
export const maxMessagesPerBlockVar = createDataVar<bigint>(0n);
