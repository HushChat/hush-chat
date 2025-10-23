import { useEffect } from 'react';
import { PLATFORM } from '@/constants/platformConstants';

/**
 * useOutsideClick
 *
 * Runs a callback when the user clicks/taps outside the given element.
 * - On web: listens to `pointerdown` + `keydown` (Escape).
 * - On native: currently no-op (you can extend for modal dismiss if needed).
 *
 * @param ref - a ref object attached to the element you want to detect outside of
 * @param handler - function to run when outside click detected
 * @param enabled - (default: true) Flag to control whether the outside click detection is active.
 */
export function useOutsideClick<T>(
  ref: React.RefObject<T>,
  handler: () => void,
  enabled: boolean = true,
) {
  useEffect(() => {
    if (!enabled || !PLATFORM.IS_WEB) return;

    const handlePointerDown = (event: Event) => {
      const el = ref.current as unknown as HTMLElement | null;
      const target = event.target as Node | null;
      if (!el || !target) return;
      if (!el.contains(target)) {
        handler();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, handler, ref]);
}
