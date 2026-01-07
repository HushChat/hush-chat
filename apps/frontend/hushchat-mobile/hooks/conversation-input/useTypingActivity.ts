import { useCallback, useEffect, useRef } from "react";

const MIN_CHARS_TO_TRIGGER_TYPING = 15;
const TYPING_IDLE_TIMEOUT_MS = 1500;

export function useTypingActivity(sendTyping: (typing: boolean) => void) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendTypingRef = useRef(sendTyping);
  const isTypingRef = useRef(false);

  useEffect(() => {
    sendTypingRef.current = sendTyping;
  }, [sendTyping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInputActivity = useCallback((currentLength: number) => {
    if (currentLength >= MIN_CHARS_TO_TRIGGER_TYPING && !isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingRef.current(true);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        sendTypingRef.current(false);
      }
      timeoutRef.current = null;
    }, TYPING_IDLE_TIMEOUT_MS);
  }, []);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTypingRef.current(false);
    }
  }, []);

  return { handleInputActivity, stopTyping };
}
