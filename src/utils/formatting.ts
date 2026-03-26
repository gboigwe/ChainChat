// ChainChat formatting utilities

export const MICRO_STX_PER_STX = 1_000_000n;
export const FORMAT_DECIMAL_PLACES = 6;
export const FORMAT_SHORT_DECIMAL = 2;
export const FORMAT_CURRENCY_SYMBOL = 'STX';
export const FORMAT_MICRO_SYMBOL = 'μSTX';
export const FORMAT_USD_SYMBOL = '$';
export const FORMAT_DATE_LOCALE = 'en-US';
export const FORMAT_TIME_ZONE = 'UTC';
export const FORMAT_ADDRESS_TRUNCATE_START = 5;
export const FORMAT_ADDRESS_TRUNCATE_END = 4;
export const FORMAT_ELLIPSIS = '...';
export const FORMAT_BLOCK_PREFIX = '#';
export const FORMAT_TX_TRUNCATE_LEN = 10;
export const FORMAT_CHANNEL_MAX_DISPLAY = 32;
export const FORMAT_MESSAGE_PREVIEW_LEN = 140;

export function formatMicroStx(microStx: bigint): string {
  const stx = Number(microStx) / Number(MICRO_STX_PER_STX);
  return stx.toFixed(FORMAT_DECIMAL_PLACES) + ' ' + FORMAT_CURRENCY_SYMBOL;
}

export function formatMicroStxShort(microStx: bigint): string {
  const stx = Number(microStx) / Number(MICRO_STX_PER_STX);
  return stx.toFixed(FORMAT_SHORT_DECIMAL) + ' ' + FORMAT_CURRENCY_SYMBOL;
}

export function formatUsdValue(stx: number, stxPriceUsd: number): string {
  return FORMAT_USD_SYMBOL + (stx * stxPriceUsd).toFixed(FORMAT_SHORT_DECIMAL);
}

export function formatAddress(address: string): string {
  if (address.length <= FORMAT_ADDRESS_TRUNCATE_START + FORMAT_ADDRESS_TRUNCATE_END) return address;
  return address.slice(0, FORMAT_ADDRESS_TRUNCATE_START) + FORMAT_ELLIPSIS + address.slice(-FORMAT_ADDRESS_TRUNCATE_END);
}

export function formatTxId(txId: string): string {
  const clean = txId.startsWith('0x') ? txId.slice(2) : txId;
  return '0x' + clean.slice(0, FORMAT_TX_TRUNCATE_LEN) + FORMAT_ELLIPSIS;
}

export function formatBlockHeight(height: number): string {
  return FORMAT_BLOCK_PREFIX + height.toLocaleString(FORMAT_DATE_LOCALE);
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString(FORMAT_DATE_LOCALE, { timeZone: FORMAT_TIME_ZONE });
}

export function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatChannelName(name: string): string {
  return name.slice(0, FORMAT_CHANNEL_MAX_DISPLAY).toLowerCase().replace(/\s+/g, '-');
}

export function formatMessagePreview(content: string): string {
  if (content.length <= FORMAT_MESSAGE_PREVIEW_LEN) return content;
  return content.slice(0, FORMAT_MESSAGE_PREVIEW_LEN) + FORMAT_ELLIPSIS;
}

export function formatFeeRate(fee: bigint, txSize: number): string {
  const rate = Number(fee) / txSize;
  return rate.toFixed(2) + ' μSTX/byte';
}
export const FORMAT_CONST_4 = 4;
export const FORMAT_CONST_5 = 5;
export const FORMAT_CONST_6 = 6;
export const FORMAT_CONST_7 = 7;
export const FORMAT_CONST_8 = 8;
export const FORMAT_CONST_9 = 9;
export const FORMAT_CONST_10 = 10;
export const FORMAT_CONST_11 = 11;
export const FORMAT_CONST_12 = 12;
export const FORMAT_CONST_13 = 13;
