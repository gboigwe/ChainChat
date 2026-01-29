/**
 * Touch Gesture Utilities
 * Support for swipe and touch interactions
 */

export interface SwipeOptions {
  threshold?: number;
  timeout?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export class TouchGestureHandler {
  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private element: HTMLElement;
  private options: SwipeOptions;

  constructor(element: HTMLElement, options: SwipeOptions = {}) {
    this.element = element;
    this.options = {
      threshold: options.threshold || 50,
      timeout: options.timeout || 500,
      ...options,
    };

    this.init();
  }

  private init(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: true,
    });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: true,
    });
  }

  private handleTouchStart(event: TouchEvent): void {
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.startTime = Date.now();
  }

  private handleTouchEnd(event: TouchEvent): void {
    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    const endTime = Date.now();

    const diffX = endX - this.startX;
    const diffY = endY - this.startY;
    const diffTime = endTime - this.startTime;

    if (diffTime > this.options.timeout!) {
      return;
    }

    const threshold = this.options.threshold!;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          this.options.onSwipeRight?.();
        } else {
          this.options.onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          this.options.onSwipeDown?.();
        } else {
          this.options.onSwipeUp?.();
        }
      }
    }
  }

  destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }
}

export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  options: SwipeOptions
): void {
  React.useEffect(() => {
    if (!elementRef.current) return;

    const handler = new TouchGestureHandler(elementRef.current, options);

    return () => handler.destroy();
  }, [elementRef, options]);
}

export default TouchGestureHandler;
