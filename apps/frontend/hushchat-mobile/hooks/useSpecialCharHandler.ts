import { TextInputKeyPressEvent } from 'react-native';

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
    const key = (e as TextInputKeyPressEvent)?.nativeEvent?.key ?? (e as WebKeyboardEvent)?.key;

    if (!key) return;

    const specialHandler = handlers[key];
    if (!specialHandler) return;

    const before = message.slice(0, cursorPosition + 1);
    if (before.length === 0 || /\s$/.test(before)) {
      specialHandler('', e);
    }
  };
}
