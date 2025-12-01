/**
 * useMessageInput
 *
 * Manages message state, draft persistence, and send actions.
 * Optimized for performance with stable callback references.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import { StorageFactory } from "@/utils/storage/storageFactory";
import { getDraftKey } from "@/constants/constants";
import { logInfo } from "@/utils/logger";

interface UseMessageInputOptions {
  conversationId: number;
  maxChars?: number;
  onDraftLoaded?: (draft: string) => void;
}

interface UseMessageInputReturn {
  message: string;
  setMessage: (text: string) => void;
  handleChangeText: (text: string) => void;
  handleSend: (messageOverride?: string) => string | null;
  clearMessage: () => void;
  flushDraft: () => void;
  isValidMessage: boolean;
}

const DEBOUNCE_DELAY = 500;

export function useMessageInput({
  conversationId,
  maxChars,
  onDraftLoaded,
}: UseMessageInputOptions): UseMessageInputReturn {
  const storage = useMemo(() => StorageFactory.createStorage(), []);
  const [message, setMessageState] = useState<string>("");

  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  const maxCharsRef = useRef(maxChars);
  maxCharsRef.current = maxChars;

  const saveDraft = useCallback(
    (id: number, text: string) => {
      void storage.save(getDraftKey(id), text);
    },
    [storage]
  );

  const saveDraftDebounced = useMemo(() => debounce(saveDraft, DEBOUNCE_DELAY), [saveDraft]);

  useEffect(() => {
    let cancelled = false;

    const loadDraft = async () => {
      try {
        const saved = await storage.get<string>(getDraftKey(conversationId));
        if (cancelled) return;

        const value = saved ?? "";
        setMessageState(value);
        onDraftLoaded?.(value);
      } catch (e) {
        logInfo("Failed to load draft", e);
      }
    };

    void loadDraft();

    return () => {
      cancelled = true;
    };
  }, [conversationId, storage, onDraftLoaded]);

  useEffect(() => {
    setMessageState("");
  }, [conversationId]);

  useEffect(() => {
    return () => {
      saveDraftDebounced.flush?.();
      saveDraftDebounced.cancel?.();
    };
  }, [saveDraftDebounced]);

  const setMessage = useCallback((text: string) => {
    setMessageState(text);
  }, []);

  const handleChangeText = useCallback(
    (raw: string) => {
      let text = raw;
      const max = maxCharsRef.current;
      if (typeof max === "number" && text.length > max) {
        text = text.slice(0, max);
      }
      setMessageState(text);
      saveDraftDebounced(conversationIdRef.current, text);
    },
    [saveDraftDebounced]
  );

  const clearMessage = useCallback(() => {
    setMessageState("");
    void storage.remove(getDraftKey(conversationIdRef.current));
  }, [storage]);

  const flushDraft = useCallback(() => {
    saveDraftDebounced.flush?.();
  }, [saveDraftDebounced]);

  const handleSend = useCallback(
    (messageOverride?: string): string | null => {
      const currentMessage = messageOverride ?? message;
      const finalMessage = currentMessage.trim();
      if (!finalMessage) return null;

      flushDraft();
      clearMessage();
      return finalMessage;
    },
    [message, flushDraft, clearMessage]
  );

  const isValidMessage = message.trim().length > 0;

  return {
    message,
    setMessage,
    handleChangeText,
    handleSend,
    clearMessage,
    flushDraft,
    isValidMessage,
  };
}
