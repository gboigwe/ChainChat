/**
 * PWA Configuration
 * Settings for Progressive Web App features
 */

export const PWA_CONFIG = {
  name: 'ChainChat',
  shortName: 'ChainChat',
  description: 'Decentralized messaging on Stacks',
  themeColor: '#667eea',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait-primary',
  startUrl: '/',
  scope: '/',
};

export const SERVICE_WORKER_CONFIG = {
  swUrl: '/sw.js',
  scope: '/',
  updateViaCache: 'none' as ServiceWorkerUpdateViaCache,
};

export const CACHE_CONFIG = {
  cacheName: 'chainchat-v1',
  runtimeCache: 'chainchat-runtime',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxEntries: 100,
};

export const OFFLINE_CONFIG = {
  enabled: true,
  fallbackPage: '/offline.html',
  queueTransactions: true,
  syncInterval: 30000, // 30 seconds
};

export const INSTALL_PROMPT_CONFIG = {
  enabled: true,
  delay: 5000, // 5 seconds
  dismissDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const PUSH_NOTIFICATION_CONFIG = {
  enabled: false, // Enable when backend is ready
  publicKey: '',
  requestPermissionOnLoad: false,
};

export const PERFORMANCE_CONFIG = {
  lazyLoadImages: true,
  codeSplitting: true,
  preloadCriticalAssets: true,
  compressionEnabled: true,
};

export default {
  PWA_CONFIG,
  SERVICE_WORKER_CONFIG,
  CACHE_CONFIG,
  OFFLINE_CONFIG,
  INSTALL_PROMPT_CONFIG,
  PUSH_NOTIFICATION_CONFIG,
  PERFORMANCE_CONFIG,
};
