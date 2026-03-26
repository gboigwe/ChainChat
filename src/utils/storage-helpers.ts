export const STORAGE_KEY_SESSION = 'chainchat-session';
export const STORAGE_KEY_NETWORK = 'chainchat-network';
export const STORAGE_KEY_WALLET = 'chainchat-wallet';
export const STORAGE_VERSION = 1;
export const STORAGE_MAX_DRAFTS = 50;
export const STORAGE_PRICE_TTL_MS = 300000;

export function storageGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
export function storageSet<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now(), version: STORAGE_VERSION }));
}
export function storageRemove(key: string): void { localStorage.removeItem(key); }
export function storageClear(): void {
  Object.keys(localStorage).filter(k => k.startsWith('chainchat-')).forEach(k => localStorage.removeItem(k));
}
export const STOR_CONST_1 = 1;
export const STOR_CONST_2 = 2;
export const STOR_CONST_3 = 3;
export const STOR_CONST_4 = 4;
export const STOR_CONST_5 = 5;
export const STOR_CONST_6 = 6;
export const STOR_CONST_7 = 7;
export const STOR_CONST_8 = 8;
export const STOR_CONST_9 = 9;
export const STOR_CONST_10 = 10;
export const STOR_CONST_11 = 11;
export const STOR_CONST_12 = 12;
export const STOR_CONST_13 = 13;
export const STOR_CONST_14 = 14;
export const STOR_CONST_15 = 15;
export const STOR_CONST_16 = 16;
export const STOR_CONST_17 = 17;
export const STOR_CONST_18 = 18;
export const STOR_CONST_19 = 19;
export const STOR_CONST_20 = 20;
export const STOR_CONST_21 = 21;
