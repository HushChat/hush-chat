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

import { TextInputKeyPressEvent } from "react-native";

export interface WebKeyboardEvent extends globalThis.KeyboardEvent {
  key: string;
  preventDefault: () => void;
}

export type SpecialCharHandler = (
  query: string,
  event: KeyboardEvent | TextInputKeyPressEvent,
) => void;

export interface UseSpecialCharOptions {
  handlers: Record<string, SpecialCharHandler>;
}

type SupportedKeyboardEvent = TextInputKeyPressEvent | WebKeyboardEvent;

/**
 * Hook to detect and handle special character triggers.
 * Supports arbitrary number of trigger characters via handlers map.
 */
export function useSpecialCharHandler(
  message: string,
  cursorPosition: number,
  { handlers }: UseSpecialCharOptions,
) {
  return (e: SupportedKeyboardEvent) => {
    const key =
      (e as TextInputKeyPressEvent)?.nativeEvent?.key ??
      (e as WebKeyboardEvent)?.key;

    if (!key) return;

    const specialHandler = handlers[key];
    if (!specialHandler) return;

    const before = message.slice(0, cursorPosition + 1);
    if (before.length === 0 || /\s$/.test(before)) {
      specialHandler("", e);
    }
  };
}
