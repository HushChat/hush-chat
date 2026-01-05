import { useCallback, useRef, useMemo, useEffect } from "react";
import { TextInput, TextInputSelectionChangeEvent } from "react-native";
import { useEnterSubmit } from "@/utils/commonUtils";
import { useSpecialCharHandler } from "@/hooks/useSpecialCharHandler";
import type { ConversationInputProps, ConversationParticipant } from "@/types/chat/types";
import { useAutoHeight } from "@/hooks/conversation-input/useAutoHeight";
import { useMessageInput } from "@/hooks/conversation-input/useMessageInput";
import { useMentions } from "@/hooks/conversation-input/useMentions";
import { useReplyHandler } from "@/hooks/conversation-input/useReplyHandler";
import { useFilePicker } from "@/hooks/conversation-input/useFilePicker";
import { useTypingActivity } from "@/hooks/conversation-input/useTypingActivity";

type TConversationInputOptions = Pick<
  ConversationInputProps,
  | "conversationId"
  | "onSendMessage"
  | "onOpenImagePicker"
  | "onOpenImagePickerNative"
  | "disabled"
  | "replyToMessage"
  | "onCancelReply"
  | "controlledValue"
  | "onControlledValueChange"
  | "onTypingStatusChange"
  | "editingMessage"
  | "onCancelEdit"
  | "onEditMessage"
>;

export function useConversationInput({
  conversationId,
  onSendMessage,
  onOpenImagePicker,
  onOpenImagePickerNative,
  disabled = false,
  replyToMessage,
  onCancelReply,
  controlledValue,
  onControlledValueChange,
  onTypingStatusChange,
  editingMessage,
  onCancelEdit,
  onEditMessage,
}: TConversationInputOptions) {
  const messageTextInputRef = useRef<TextInput>(null);
  const defaultPlaceholderText = "Type a message...";
  const editPlaceholderText = "Edit message...";
  const minLines = 1;
  const maxLines = 6;
  const lineHeight = 22;
  const verticalPadding = 12;

  const isControlledMode = controlledValue !== undefined;
  const isEditMode = !!editingMessage;

  const inputDisabledStatusRef = useRef(disabled);
  inputDisabledStatusRef.current = disabled;

  const sendMessageCallbackRef = useRef(onSendMessage);
  sendMessageCallbackRef.current = onSendMessage;

  const editMessageCallbackRef = useRef(onEditMessage);
  editMessageCallbackRef.current = onEditMessage;

  const editingMessageRef = useRef(editingMessage);
  editingMessageRef.current = editingMessage;

  const autoHeightController = useAutoHeight({
    minLines,
    maxLines,
    lineHeight,
    verticalPadding,
  });

  const messageInputController = useMessageInput({
    conversationId,
  });

  // Use controlled value if provided, otherwise use internal state
  const currentMessage = isControlledMode
    ? controlledValue
    : messageInputController.currentTypedMessage;

  const latestMessageTextRef = useRef(currentMessage);
  latestMessageTextRef.current = currentMessage;

  const typingActivity = useTypingActivity((typing: boolean) => {
    onTypingStatusChange?.(typing, conversationId);
  });

  useEffect(() => {
    if (editingMessage) {
      if (isControlledMode) {
        onControlledValueChange?.(editingMessage.messageText);
      } else {
        messageInputController.updateTypedMessageText(editingMessage.messageText);
      }
      setTimeout(() => {
        messageTextInputRef.current?.focus();
      }, 100);
    }
  }, [editingMessage?.id]);

  useEffect(() => {
    if (!editingMessage && editingMessageRef.current) {
      if (isControlledMode) {
        onControlledValueChange?.("");
      } else {
        messageInputController.updateTypedMessageText("");
      }
    }
  }, [editingMessage]);

  const mentionsController = useMentions({
    textInputRef: messageTextInputRef,
    onMessageUpdate: isControlledMode
      ? onControlledValueChange!
      : messageInputController.updateTypedMessageText,
  });

  const cursorLocationRef = useRef(mentionsController.currentCursorIndex);
  cursorLocationRef.current = mentionsController.currentCursorIndex;

  const replyManager = useReplyHandler({
    replyToMessage,
    onCancelReply,
  });

  const replyManagerRef = useRef(replyManager);
  replyManagerRef.current = replyManager;

  const fileAttachmentPicker = useFilePicker({
    onFilesSelected: onOpenImagePicker,
    onOpenNativePicker: onOpenImagePickerNative,
  });

  const handleMessageTextChangedByUser = useCallback(
    (newTypedText: string) => {
      if (isControlledMode) {
        onControlledValueChange!(newTypedText);
      } else {
        messageInputController.onMessageTextChangedByUser(newTypedText);
      }
      mentionsController.evaluateMentionQueryFromInput(newTypedText, cursorLocationRef.current);
      autoHeightController.updateHeightForClearedText(newTypedText);

      typingActivity.handleInputActivity(newTypedText.length);
    },
    [
      isControlledMode,
      onControlledValueChange,
      messageInputController.onMessageTextChangedByUser,
      mentionsController.evaluateMentionQueryFromInput,
      autoHeightController.updateHeightForClearedText,
      typingActivity.handleInputActivity,
    ]
  );

  const handleInputCursorSelectionChanged = useCallback(
    (event: TextInputSelectionChangeEvent) => {
      mentionsController.updateCursorIndex(event.nativeEvent.selection.start);
    },
    [mentionsController.updateCursorIndex]
  );

  const handleCancelEditMode = useCallback(() => {
    if (isControlledMode) {
      onControlledValueChange?.("");
    } else {
      messageInputController.updateTypedMessageText("");
    }
    autoHeightController.animateHeightResetToMinimum();
    onCancelEdit?.();
  }, [
    isControlledMode,
    onControlledValueChange,
    messageInputController.updateTypedMessageText,
    autoHeightController.animateHeightResetToMinimum,
    onCancelEdit,
  ]);

  const handleSendOrEdit = useCallback(
    (overrideMessageText?: string) => {
      const messageToProcess = overrideMessageText ?? currentMessage;
      const processedMessage = messageToProcess.trim();

      if (editingMessageRef.current) {
        if (!processedMessage) {
          return;
        }

        editMessageCallbackRef.current?.(editingMessageRef.current.id, processedMessage);

        if (!isControlledMode) {
          messageInputController.updateTypedMessageText("");
        }

        autoHeightController.animateHeightResetToMinimum();
        requestAnimationFrame(() => messageTextInputRef.current?.focus());
        return;
      }

      if (!processedMessage || inputDisabledStatusRef.current) {
        if (isControlledMode) {
          sendMessageCallbackRef.current(
            processedMessage,
            replyManagerRef.current.activeReplyTargetMessage ?? undefined
          );
          return;
        }
        return;
      }

      if (!isControlledMode) {
        messageInputController.clearMessageAndDeleteDraft();
      }

      sendMessageCallbackRef.current(
        processedMessage,
        replyManagerRef.current.activeReplyTargetMessage ?? undefined
      );

      autoHeightController.animateHeightResetToMinimum();
      mentionsController.clearActiveMentionQuery();
      mentionsController.clearValidMentions();

      if (replyManagerRef.current.isReplyModeActive) {
        replyManagerRef.current.cancelReplyMode();
      }

      typingActivity.stopTyping();

      requestAnimationFrame(() => messageTextInputRef.current?.focus());
    },
    [
      currentMessage,
      isControlledMode,
      messageInputController.clearMessageAndDeleteDraft,
      messageInputController.updateTypedMessageText,
      autoHeightController.animateHeightResetToMinimum,
      mentionsController.clearActiveMentionQuery,
      mentionsController.clearValidMentions,
      typingActivity.stopTyping,
    ]
  );

  const handleUserSelectedMention = useCallback(
    (participant: ConversationParticipant) => {
      const updatedMessage = mentionsController.handleUserSelectedMention(
        participant,
        latestMessageTextRef.current
      );

      if (isControlledMode) {
        onControlledValueChange!(updatedMessage);
      } else {
        messageInputController.updateTypedMessageText(updatedMessage);
      }
    },
    [
      isControlledMode,
      onControlledValueChange,
      mentionsController.handleUserSelectedMention,
      messageInputController.updateTypedMessageText,
    ]
  );

  const stableSendHandlerRef = useRef(handleSendOrEdit);
  stableSendHandlerRef.current = handleSendOrEdit;

  const keyboardEnterToSendHandler = useEnterSubmit(() => {
    stableSendHandlerRef.current(latestMessageTextRef.current);
  });

  const specialCharacterInputController = useSpecialCharHandler(
    currentMessage,
    mentionsController.currentCursorIndex,
    { handlers: { "@": mentionsController.manuallyTriggerMentionPicker } }
  );

  const resolvedPlaceholderText = useMemo(() => {
    if (isEditMode) {
      return editPlaceholderText;
    }
    return replyManager.generateReplyAwarePlaceholder(defaultPlaceholderText);
  }, [isEditMode, replyManager.generateReplyAwarePlaceholder, defaultPlaceholderText]);

  const handleSendButtonPress = useCallback(() => {
    stableSendHandlerRef.current(latestMessageTextRef.current);
  }, []);

  const isValidMessage = currentMessage.trim().length > 0;

  return {
    messageTextInputRef,

    message: currentMessage,
    isValidMessage,

    isEditMode,
    editingMessage,
    handleCancelEdit: handleCancelEditMode,

    inputHeight: autoHeightController.currentInputHeight,
    minHeight: autoHeightController.minimumInputHeight,
    maxHeight: autoHeightController.maximumInputHeight,
    animatedContainerStyle: autoHeightController.animatedHeightStyle,
    handleContentSizeChange: autoHeightController.handleTextContainerSizeChange,

    mentionQuery: mentionsController.activeMentionQueryText,
    mentionVisible: mentionsController.isMentionSuggestionsVisible,
    validMentionUsernames: mentionsController.validMentions,
    handleSelectMention: handleUserSelectedMention,

    isReplying: replyManager.isReplyModeActive,
    replyToMessage: replyManager.activeReplyTargetMessage,
    handleCancelReply: replyManager.cancelReplyMode,

    fileInputRef: fileAttachmentPicker.fileInputElementRef,
    documentInputRef: fileAttachmentPicker.documentInputElementRef,
    addButtonRef: fileAttachmentPicker.fileActionButtonRef,
    menuVisible: fileAttachmentPicker.isMenuOpen,
    menuPosition: fileAttachmentPicker.menuScreenCoordinates,
    menuOptions: fileAttachmentPicker.menuActionOptions,
    handleAddButtonPress: fileAttachmentPicker.handleFileActionButtonPress,
    handleFileChange: fileAttachmentPicker.handleFileInputChange,
    handleDocumentChange: fileAttachmentPicker.handleDocumentInputChange,
    closeMenu: fileAttachmentPicker.closeFileActionMenu,
    handleMenuOptionSelect: fileAttachmentPicker.executeMenuOption,

    handleChangeText: handleMessageTextChangedByUser,
    handleSelectionChange: handleInputCursorSelectionChanged,
    handleSend: handleSendOrEdit,
    enterSubmitHandler: keyboardEnterToSendHandler,
    specialCharHandler: specialCharacterInputController,
    handleSendButtonPress,

    placeholder: resolvedPlaceholderText,
  };
}
