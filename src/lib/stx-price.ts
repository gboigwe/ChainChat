/**
 * STX price feed integration
 * Fetches STX/USD price from multiple sources with fallback
 */

import { type StacksNetworkName } from '../config/network-config';

export interface StxPriceData {
  usdPrice: number;
  btcPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: number; // unix timestamp
  source: string;
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const COINMARKETCAP_API = 'https://pro-api.coinmarketcap.com/v1';

// Cache
let _cachedPrice: StxPriceData | null = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

/**
 * Fetch STX price from CoinGecko
 */
async function fetchFromCoinGecko(): Promise<StxPriceData> {
  const response = await fetch(
    `${COINGECKO_API}/coins/blockstack?localization=false&tickers=false&community_data=false&developer_data=false`
  );

  if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);

  const data = await response.json();
  const market = data.market_data;

  return {
    usdPrice: market.current_price.usd,
    btcPrice: market.current_price.btc,
    priceChange24h: market.price_change_percentage_24h,
    priceChange7d: market.price_change_percentage_7d,
    marketCap: market.market_cap.usd,
    volume24h: market.total_volume.usd,
    lastUpdated: Math.floor(Date.now() / 1000),
    source: 'coingecko',
  };
}

/**
 * Fetch STX price from Hiro price API
 */
async function fetchFromHiro(): Promise<StxPriceData> {
  const response = await fetch('https://api.hiro.so/extended/v1/market/tokens/prices?limit=1');
  if (!response.ok) throw new Error(`Hiro price API error: ${response.status}`);

  const data = await response.json();
  const stxData = data?.results?.find((t: any) => t.symbol === 'STX') || data;

  return {
    usdPrice: parseFloat(stxData.price_usd || '0'),
    btcPrice: parseFloat(stxData.price_btc || '0'),
    priceChange24h: parseFloat(stxData.price_change_24h || '0'),
    priceChange7d: 0,
    marketCap: 0,
    volume24h: 0,
    lastUpdated: Math.floor(Date.now() / 1000),
    source: 'hiro',
  };
}

/**
 * Get current STX price with caching and fallback
 */
export async function getStxPrice(forceRefresh = false): Promise<StxPriceData> {
  const now = Date.now();

  if (!forceRefresh && _cachedPrice && now - _cacheTime < CACHE_TTL_MS) {
    return _cachedPrice;
  }

  const sources = [fetchFromCoinGecko, fetchFromHiro];

  for (const source of sources) {
    try {
      const price = await source();
      _cachedPrice = price;
      _cacheTime = now;
      return price;
    } catch {
      // Try next source
    }
  }

  // Return stale cache if all sources fail
  if (_cachedPrice) {
    return { ..._cachedPrice, source: `${_cachedPrice.source} (stale)` };
  }

  throw new Error('All STX price sources failed');
}

/**
 * Convert STX amount to USD
 */
export async function stxToUsd(stxAmount: number): Promise<number> {
  const price = await getStxPrice();
  return stxAmount * price.usdPrice;
}

/**
 * Convert USD amount to STX
 */
export async function usdToStx(usdAmount: number): Promise<number> {
  const price = await getStxPrice();
  if (price.usdPrice === 0) throw new Error('STX price is zero');
  return usdAmount / price.usdPrice;
}

/**
 * Convert micro-STX to USD
 */
export async function microStxToUsd(microStx: bigint): Promise<number> {
  const stx = Number(microStx) / 1_000_000;
  return stxToUsd(stx);
}

/**
 * Format USD price for display
 */
export function formatUsdPrice(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(usd);
}

/**
 * Format price change percentage
 */
export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}
