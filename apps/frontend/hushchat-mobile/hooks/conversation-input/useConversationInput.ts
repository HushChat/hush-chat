/**
 * useConversationInput
 *
 * Orchestrating hook that combines all conversation input functionality.
 * Optimized for performance with stable references to prevent re-render lag.
 */

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

interface UseConversationInputOptions
  extends Pick<
    ConversationInputProps,
    | "conversationId"
    | "onSendMessage"
    | "onOpenImagePicker"
    | "onOpenImagePickerNative"
    | "disabled"
    | "replyToMessage"
    | "onCancelReply"
    | "maxChars"
    | "minLines"
    | "maxLines"
    | "lineHeight"
    | "verticalPadding"
    | "placeholder"
  > {
  minLines: number;
  maxLines: number;
  lineHeight: number;
  verticalPadding: number;
  placeholder: string;
}

export function useConversationInput({
  conversationId,
  onSendMessage,
  onOpenImagePicker,
  onOpenImagePickerNative,
  disabled = false,
  replyToMessage,
  onCancelReply,
  maxChars,
  minLines,
  maxLines,
  lineHeight,
  verticalPadding,
  placeholder,
}: UseConversationInputOptions) {
  const textInputRef = useRef<TextInput>(null);

  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const onSendMessageRef = useRef(onSendMessage);
  onSendMessageRef.current = onSendMessage;

  const autoHeight = useAutoHeight({
    minLines,
    maxLines,
    lineHeight,
    verticalPadding,
  });

  const messageInput = useMessageInput({
    conversationId,
    maxChars,
  });

  const messageRef = useRef(messageInput.message);
  messageRef.current = messageInput.message;

  const mentions = useMentions({
    textInputRef,
    onMessageUpdate: messageInput.setMessage,
  });

  const cursorPositionRef = useRef(mentions.cursorPosition);
  cursorPositionRef.current = mentions.cursorPosition;

  const reply = useReplyHandler({
    replyToMessage,
    onCancelReply,
  });

  const replyRef = useRef(reply);
  replyRef.current = reply;

  const filePicker = useFilePicker({
    onFilesSelected: onOpenImagePicker,
    onOpenNativePicker: onOpenImagePickerNative,
  });

  const handleChangeText = useCallback(
    (text: string) => {
      messageInput.handleChangeText(text);
      mentions.updateMentionQuery(text, cursorPositionRef.current);
      autoHeight.updateHeightForText(text);
    },
    [messageInput.handleChangeText, mentions.updateMentionQuery, autoHeight.updateHeightForText]
  );

  const handleSelectionChange = useCallback(
    (e: TextInputSelectionChangeEvent) => {
      mentions.setCursorPosition(e.nativeEvent.selection.start);
    },
    [mentions.setCursorPosition]
  );

  const handleSend = useCallback(
    (messageOverride?: string) => {
      const finalMessage = messageInput.handleSend(messageOverride);
      if (!finalMessage || disabledRef.current) return;

      onSendMessageRef.current(finalMessage, replyRef.current.replyToMessage || undefined);

      autoHeight.resetHeight();
      mentions.clearMention();

      if (replyRef.current.isReplying) {
        replyRef.current.handleCancelReply();
      }

      requestAnimationFrame(() => {
        textInputRef.current?.focus();
      });
    },
    [messageInput.handleSend, autoHeight.resetHeight, mentions.clearMention]
  );

  // Mention selection handler
  const handleSelectMention = useCallback(
    (participant: ConversationParticipant) => {
      const newText = mentions.handleSelectMention(participant, messageRef.current);
      messageInput.setMessage(newText);
    },
    [mentions.handleSelectMention, messageInput.setMessage]
  );

  // Keyboard handlers - use refs to keep stable
  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;

  const enterSubmitHandler = useEnterSubmit(() => {
    handleSendRef.current(messageRef.current);
  });

  const specialCharHandler = useSpecialCharHandler(messageInput.message, mentions.cursorPosition, {
    handlers: { "@": mentions.triggerMention },
  });

  // Memoize the placeholder
  const computedPlaceholder = useMemo(
    () => reply.getPlaceholder(placeholder),
    [reply.getPlaceholder, placeholder]
  );

  return {
    // Refs
    textInputRef,

    // Message state
    message: messageInput.message,
    isValidMessage: messageInput.isValidMessage,

    // Height
    inputHeight: autoHeight.inputHeight,
    minHeight: autoHeight.minHeight,
    maxHeight: autoHeight.maxHeight,
    animatedContainerStyle: autoHeight.animatedContainerStyle,
    handleContentSizeChange: autoHeight.handleContentSizeChange,

    // Mentions
    mentionQuery: mentions.mentionQuery,
    mentionVisible: mentions.mentionVisible,
    handleSelectMention,

    // Reply
    isReplying: reply.isReplying,
    replyToMessage: reply.replyToMessage,
    handleCancelReply: reply.handleCancelReply,

    // File picker
    fileInputRef: filePicker.fileInputRef,
    addButtonRef: filePicker.addButtonRef,
    menuVisible: filePicker.menuVisible,
    menuPosition: filePicker.menuPosition,
    menuOptions: filePicker.menuOptions,
    handleAddButtonPress: filePicker.handleAddButtonPress,
    handleFileChange: filePicker.handleFileChange,
    closeMenu: filePicker.closeMenu,
    handleMenuOptionSelect: filePicker.handleMenuOptionSelect,

    // Handlers
    handleChangeText,
    handleSelectionChange,
    handleSend,
    enterSubmitHandler,
    specialCharHandler,

    // Config
    placeholder: computedPlaceholder,
    lineHeight,
    verticalPadding,
    maxChars,
  };
}
