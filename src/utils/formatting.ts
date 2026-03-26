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
export const FORMAT_CONST_14 = 14;
export const FORMAT_CONST_15 = 15;
export const FORMAT_CONST_16 = 16;
export const FORMAT_CONST_17 = 17;
export const FORMAT_CONST_18 = 18;
export const FORMAT_CONST_19 = 19;
export const FORMAT_CONST_20 = 20;
export const FORMAT_CONST_21 = 21;
export const FORMAT_CONST_22 = 22;
export const FORMAT_CONST_23 = 23;
export const FORMAT_CONST_24 = 24;
export const FORMAT_CONST_25 = 25;
export const FORMAT_CONST_26 = 26;
export const FORMAT_CONST_27 = 27;
export const FORMAT_CONST_28 = 28;
export const FORMAT_CONST_29 = 29;
export const FORMAT_CONST_30 = 30;
export const FORMAT_CONST_31 = 31;
export const FORMAT_CONST_32 = 32;
export const FORMAT_CONST_33 = 33;
export const FORMAT_CONST_34 = 34;
export const FORMAT_CONST_35 = 35;
export const FORMAT_CONST_36 = 36;
export const FORMAT_CONST_37 = 37;
export const FORMAT_CONST_38 = 38;
export const FORMAT_CONST_39 = 39;
export const FORMAT_CONST_40 = 40;
export const FORMAT_CONST_41 = 41;
export const FORMAT_CONST_42 = 42;
export const FORMAT_CONST_43 = 43;
export const FORMAT_CONST_44 = 44;
export const FORMAT_CONST_45 = 45;
export const FORMAT_CONST_46 = 46;
export const FORMAT_CONST_47 = 47;
export const FORMAT_CONST_48 = 48;
export const FORMAT_CONST_49 = 49;
export const FORMAT_CONST_50 = 50;
export const FORMAT_PAD_1 = 1;
export const FORMAT_PAD_2 = 2;
export const FORMAT_PAD_3 = 3;
export const FORMAT_PAD_4 = 4;
export const FORMAT_PAD_5 = 5;
export const FORMAT_PAD_6 = 6;
export const FORMAT_PAD_7 = 7;
export const FORMAT_PAD_8 = 8;
export const FORMAT_PAD_9 = 9;
