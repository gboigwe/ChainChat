/**
 * Mobile Utilities
 * Helper functions for mobile features
 */

export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

export function preventZoom(): void {
  document.addEventListener(
    'gesturestart',
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );
}

export function enableFullscreen(element?: HTMLElement): void {
  const el = element || document.documentElement;

  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if ((el as any).webkitRequestFullscreen) {
    (el as any).webkitRequestFullscreen();
  } else if ((el as any).msRequestFullscreen) {
    (el as any).msRequestFullscreen();
  }
}

export function exitFullscreen(): void {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen();
  }
}

export function vibrate(pattern: number | number[]): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

export function shareContent(data: ShareData): Promise<void> {
  if (navigator.share) {
    return navigator.share(data);
  }
  return Promise.reject(new Error('Web Share API not supported'));
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve();
  } catch (err) {
    document.body.removeChild(textArea);
    return Promise.reject(err);
  }
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.reject(new Error('Notifications not supported'));
  }

  return Notification.requestPermission();
}

export function showNotification(
  title: string,
  options?: NotificationOptions
): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
}

export function addToHomeScreen(): void {
  // This relies on the beforeinstallprompt event
  const event = (window as any).deferredPrompt;
  if (event) {
    event.prompt();
  }
}

export function getDeviceInfo() {
  return {
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isPWA: isPWA(),
    isOnline: isOnline(),
    isTouchDevice: isTouchDevice(),
    viewport: getViewportSize(),
    userAgent: navigator.userAgent,
  };
}

export default {
  isMobile,
  isIOS,
  isAndroid,
  isPWA,
  isOnline,
  getViewportSize,
  isTouchDevice,
  preventZoom,
  enableFullscreen,
  exitFullscreen,
  vibrate,
  shareContent,
  copyToClipboard,
  requestNotificationPermission,
  showNotification,
  addToHomeScreen,
  getDeviceInfo,
};
