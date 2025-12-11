import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import { StorageFactory } from "@/utils/storage/storageFactory";
import { getDraftKey } from "@/constants/constants";
import { logInfo } from "@/utils/logger";
import { IMessage } from "@/types/chat/types";

interface UseMessageInputOptions {
  conversationId: number;
  maxChars?: number;
  onDraftLoaded?: (loadedDraftText: string) => void;
  editMessage: IMessage | null;
}

interface UseMessageInputReturn {
  currentTypedMessage: string;
  updateTypedMessageText: (newMessageText: string) => void;
  onMessageTextChangedByUser: (newInputText: string) => void;
  finalizeAndReturnMessageForSending: (optionalOverrideText?: string) => string | null;
  clearMessageAndDeleteDraft: () => void;
  flushPendingDraftWritesImmediately: () => void;
  isMessageNonEmptyAndSendable: boolean;
}

const AUTOSAVE_DEBOUNCE_INTERVAL_MS = 500;

export function useMessageInput({
  conversationId,
  maxChars,
  onDraftLoaded,
  editMessage,
}: UseMessageInputOptions): UseMessageInputReturn {
  const persistentDraftStorageInstance = useMemo(() => StorageFactory.createStorage(), []);

  const [currentTypedMessage, setCurrentTypedMessage] = useState<string>("");

  useEffect(() => {
    if (editMessage) {
      setCurrentTypedMessage(editMessage?.messageText);
    }
  }, [editMessage]);

  const activeConversationIdRef = useRef(conversationId);
  activeConversationIdRef.current = conversationId;

  const configuredCharacterLimitRef = useRef(maxChars);
  configuredCharacterLimitRef.current = maxChars;

  const persistDraftToStorage = useCallback(
    (conversationIdentifier: number, messageContentToSave: string) => {
      void persistentDraftStorageInstance.save(
        getDraftKey(conversationIdentifier),
        messageContentToSave
      );
    },
    [persistentDraftStorageInstance]
  );

  const persistDraftToStorageWithDelay = useMemo(
    () => debounce(persistDraftToStorage, AUTOSAVE_DEBOUNCE_INTERVAL_MS),
    [persistDraftToStorage]
  );

  useEffect(() => {
    let effectWasCancelled = false;

    const loadExistingDraftFromStorage = async () => {
      try {
        const storedDraftText = await persistentDraftStorageInstance.get<string>(
          getDraftKey(conversationId)
        );

        if (effectWasCancelled) return;

        const recoveredDraftText = storedDraftText ?? "";
        setCurrentTypedMessage(recoveredDraftText);
        onDraftLoaded?.(recoveredDraftText);
      } catch (error) {
        logInfo("Draft load attempt failed", error);
      }
    };

    void loadExistingDraftFromStorage();

    return () => {
      effectWasCancelled = true;
    };
  }, [conversationId, persistentDraftStorageInstance, onDraftLoaded]);

  useEffect(() => {
    setCurrentTypedMessage("");
  }, [conversationId]);

  useEffect(() => {
    return () => {
      persistDraftToStorageWithDelay.flush?.();
      persistDraftToStorageWithDelay.cancel?.();
    };
  }, [persistDraftToStorageWithDelay]);

  const updateTypedMessageText = useCallback((incomingTextValue: string) => {
    setCurrentTypedMessage(incomingTextValue);
  }, []);

  const onMessageTextChangedByUser = useCallback(
    (newRawInputText: string) => {
      let sanitizedTextForInput = newRawInputText;
      const characterLimit = configuredCharacterLimitRef.current;

      if (typeof characterLimit === "number" && sanitizedTextForInput.length > characterLimit) {
        sanitizedTextForInput = sanitizedTextForInput.slice(0, characterLimit);
      }

      setCurrentTypedMessage(sanitizedTextForInput);
      persistDraftToStorageWithDelay(activeConversationIdRef.current, sanitizedTextForInput);
    },
    [persistDraftToStorageWithDelay]
  );

  const clearMessageAndDeleteDraft = useCallback(() => {
    setCurrentTypedMessage("");
    void persistentDraftStorageInstance.remove(getDraftKey(activeConversationIdRef.current));
  }, [persistentDraftStorageInstance]);

  const flushPendingDraftWritesImmediately = useCallback(() => {
    persistDraftToStorageWithDelay.flush?.();
  }, [persistDraftToStorageWithDelay]);

  const finalizeAndReturnMessageForSending = useCallback(
    (optionalOverrideText?: string): string | null => {
      const messageToProcess = optionalOverrideText ?? currentTypedMessage;
      const cleanedAndTrimmedMessage = messageToProcess.trim();

      if (!cleanedAndTrimmedMessage) return null;

      flushPendingDraftWritesImmediately();
      clearMessageAndDeleteDraft();
      return cleanedAndTrimmedMessage;
    },
    [currentTypedMessage, flushPendingDraftWritesImmediately, clearMessageAndDeleteDraft]
  );

  const isMessageNonEmptyAndSendable = Boolean(
    currentTypedMessage.trim().length > 0 &&
      editMessage &&
      editMessage.messageText !== currentTypedMessage
  );

  return {
    currentTypedMessage,
    updateTypedMessageText,
    onMessageTextChangedByUser,
    finalizeAndReturnMessageForSending,
    clearMessageAndDeleteDraft,
    flushPendingDraftWritesImmediately,
    isMessageNonEmptyAndSendable,
  };
}
