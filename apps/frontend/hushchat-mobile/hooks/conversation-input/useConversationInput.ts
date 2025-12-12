import { useCallback, useRef, useMemo } from "react";
import { TextInput, TextInputSelectionChangeEvent } from "react-native";
import { useEnterSubmit } from "@/utils/commonUtils";
import { useSpecialCharHandler } from "@/hooks/useSpecialCharHandler";
import type { ConversationInputProps, ConversationParticipant } from "@/types/chat/types";
import { useAutoHeight } from "@/hooks/conversation-input/useAutoHeight";
import { useMessageInput } from "@/hooks/conversation-input/useMessageInput";
import { useMentions } from "@/hooks/conversation-input/useMentions";
import { useReplyHandler } from "@/hooks/conversation-input/useReplyHandler";
import { useFilePicker } from "@/hooks/conversation-input/useFilePicker";

type TConversationInputOptions = Pick<
  ConversationInputProps,
  | "conversationId"
  | "onSendMessage"
  | "onOpenImagePicker"
  | "onOpenImagePickerNative"
  | "disabled"
  | "replyToMessage"
  | "onCancelReply"
>;

export function useConversationInput({
  conversationId,
  onSendMessage,
  onOpenImagePicker,
  onOpenImagePickerNative,
  disabled = false,
  replyToMessage,
  onCancelReply,
}: TConversationInputOptions) {
  const messageTextInputRef = useRef<TextInput>(null);
  const defaultPlaceholderText = "Type a message...";
  const minLines = 1;
  const maxLines = 6;
  const lineHeight = 22;
  const verticalPadding = 12;

  const inputDisabledStatusRef = useRef(disabled);
  inputDisabledStatusRef.current = disabled;

  const sendMessageCallbackRef = useRef(onSendMessage);
  sendMessageCallbackRef.current = onSendMessage;

  const autoHeightController = useAutoHeight({
    minLines,
    maxLines,
    lineHeight,
    verticalPadding,
  });

  const messageInputController = useMessageInput({
    conversationId,
  });

  const latestMessageTextRef = useRef(messageInputController.currentTypedMessage);
  latestMessageTextRef.current = messageInputController.currentTypedMessage;

  const mentionsController = useMentions({
    textInputRef: messageTextInputRef,
    onMessageUpdate: messageInputController.updateTypedMessageText,
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
      messageInputController.onMessageTextChangedByUser(newTypedText);
      mentionsController.evaluateMentionQueryFromInput(newTypedText, cursorLocationRef.current);
      autoHeightController.updateHeightForClearedText(newTypedText);
    },
    [
      messageInputController.onMessageTextChangedByUser,
      mentionsController.evaluateMentionQueryFromInput,
      autoHeightController.updateHeightForClearedText,
    ]
  );

  const handleInputCursorSelectionChanged = useCallback(
    (event: TextInputSelectionChangeEvent) => {
      mentionsController.updateCursorIndex(event.nativeEvent.selection.start);
    },
    [mentionsController.updateCursorIndex]
  );

  const handleSendFinalProcessedMessage = useCallback(
    (overrideMessageText?: string) => {
      const processedMessage =
        messageInputController.finalizeAndReturnMessageForSending(overrideMessageText);

      if (!processedMessage || inputDisabledStatusRef.current) return;

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

      requestAnimationFrame(() => messageTextInputRef.current?.focus());
    },
    [
      messageInputController.finalizeAndReturnMessageForSending,
      autoHeightController.animateHeightResetToMinimum,
      mentionsController.clearActiveMentionQuery,
      mentionsController.clearValidMentions,
    ]
  );

  const handleUserSelectedMention = useCallback(
    (participant: ConversationParticipant) => {
      const updatedMessage = mentionsController.handleUserSelectedMention(
        participant,
        latestMessageTextRef.current
      );

      messageInputController.updateTypedMessageText(updatedMessage);
    },
    [mentionsController.handleUserSelectedMention, messageInputController.updateTypedMessageText]
  );

  const stableSendHandlerRef = useRef(handleSendFinalProcessedMessage);
  stableSendHandlerRef.current = handleSendFinalProcessedMessage;

  const keyboardEnterToSendHandler = useEnterSubmit(() => {
    stableSendHandlerRef.current(latestMessageTextRef.current);
  });

  const specialCharacterInputController = useSpecialCharHandler(
    messageInputController.currentTypedMessage,
    mentionsController.currentCursorIndex,
    { handlers: { "@": mentionsController.manuallyTriggerMentionPicker } }
  );

  const resolvedPlaceholderText = useMemo(
    () => replyManager.generateReplyAwarePlaceholder(defaultPlaceholderText),
    [replyManager.generateReplyAwarePlaceholder, defaultPlaceholderText]
  );

  const handleSendButtonPress = useCallback(() => {
    stableSendHandlerRef.current(latestMessageTextRef.current);
  }, []);

  return {
    messageTextInputRef,

    message: messageInputController.currentTypedMessage,
    isValidMessage: messageInputController.isMessageNonEmptyAndSendable,

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
    handleSend: handleSendFinalProcessedMessage,
    enterSubmitHandler: keyboardEnterToSendHandler,
    specialCharHandler: specialCharacterInputController,
    handleSendButtonPress,

    placeholder: resolvedPlaceholderText,
  };
}
