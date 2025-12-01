/**
 * useMessageInput
 *
 * Manages message state, draft persistence, and send actions.
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

  const saveDraftDebounced = useRef(
    debounce((id: number, text: string) => {
      void storage.save(getDraftKey(id), text);
    }, DEBOUNCE_DELAY)
  ).current;

  // Load draft on conversation change
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

  // Reset on conversation switch
  useEffect(() => {
    setMessageState("");
  }, [conversationId]);

  // Cleanup debounce on unmount
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
      if (typeof maxChars === "number" && text.length > maxChars) {
        text = text.slice(0, maxChars);
      }
      setMessageState(text);
      saveDraftDebounced(conversationId, text);
    },
    [maxChars, conversationId, saveDraftDebounced]
  );

  const clearMessage = useCallback(() => {
    setMessageState("");
    void storage.remove(getDraftKey(conversationId));
  }, [storage, conversationId]);

  const flushDraft = useCallback(() => {
    saveDraftDebounced.flush?.();
  }, [saveDraftDebounced]);

  const handleSend = useCallback(
    (messageOverride?: string): string | null => {
      const finalMessage = (messageOverride ?? message).trim();
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
