/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useEffect } from "react";
import { PLATFORM } from "@/constants/platformConstants";

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
      if (event.key === "Escape") {
        handler();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [enabled, handler, ref]);
}
