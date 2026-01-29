/**
 * Performance Optimization Utilities
 * Functions for improving mobile performance
 */

export function lazyLoadImages(): void {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }
}

export function preloadCriticalAssets(urls: string[]): void {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = getAssetType(url);
    link.href = url;
    document.head.appendChild(link);
  });
}

function getAssetType(url: string): string {
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
  if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
  if (url.match(/\.css$/i)) return 'style';
  if (url.match(/\.js$/i)) return 'script';
  return 'fetch';
}

export function deferNonCriticalCSS(href: string): void {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print';
  link.onload = () => {
    link.media = 'all';
  };
  document.head.appendChild(link);
}

export function optimizeWebFonts(): void {
  if ('fonts' in document) {
    (document as any).fonts.load('16px Inter').then(() => {
      document.documentElement.classList.add('fonts-loaded');
    });
  }
}

export function reduceMotionForAccessibility(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function enableDarkMode(): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.classList.add('dark-mode');
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

export function measurePerformance(name: string, callback: () => void): void {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
}

export function reportWebVitals(metric: any): void {
  console.log(metric);

  // Send to analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    // navigator.sendBeacon('/api/analytics', JSON.stringify(metric));
  }
}

export function prefetchRoute(url: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

export function getConnectionSpeed(): string {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (connection) {
    return connection.effectiveType || 'unknown';
  }

  return 'unknown';
}

export function shouldReduceDataUsage(): boolean {
  const connection = (navigator as any).connection;
  return connection && connection.saveData;
}

export default {
  lazyLoadImages,
  preloadCriticalAssets,
  deferNonCriticalCSS,
  optimizeWebFonts,
  reduceMotionForAccessibility,
  enableDarkMode,
  debounce,
  throttle,
  measurePerformance,
  reportWebVitals,
  prefetchRoute,
  getConnectionSpeed,
  shouldReduceDataUsage,
};
