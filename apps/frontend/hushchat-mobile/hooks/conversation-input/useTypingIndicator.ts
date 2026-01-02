import { useCallback, useEffect, useRef } from "react";

export function useTypingIndicator(
  sendTyping: (typing: boolean) => void,
  idleMs = 1200,
  minChars = 15 // 2-3 words
) {
  const typingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sendTypingRef = useRef(sendTyping);
  const charCountRef = useRef(0);

  // Keep sendTyping ref up to date without affecting callbacks
  useEffect(() => {
    sendTypingRef.current = sendTyping;
  }, [sendTyping]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onType = useCallback(
    (currentLength: number) => {
      charCountRef.current = currentLength;

      // Only send "typing" indicator if they've typed enough
      if (currentLength >= minChars && !typingRef.current) {
        typingRef.current = true;
        sendTypingRef.current(true);
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout to stop typing
      timeoutRef.current = setTimeout(() => {
        if (typingRef.current) {
          typingRef.current = false;
          sendTypingRef.current(false);
        }
        charCountRef.current = 0;
        timeoutRef.current = null;
      }, idleMs);
    },
    [idleMs, minChars]
  );

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (typingRef.current) {
      typingRef.current = false;
      sendTypingRef.current(false);
    }

    charCountRef.current = 0;
  }, []);

  return { onType, stopTyping };
}
