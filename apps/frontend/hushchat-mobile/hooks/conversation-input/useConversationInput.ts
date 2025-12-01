/**
 * useConversationInput
 *
 * Orchestrating hook that combines all conversation input functionality.
 */

import { useCallback, useRef } from "react";
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

  // Auto height management
  const autoHeight = useAutoHeight({
    minLines,
    maxLines,
    lineHeight,
    verticalPadding,
  });

  // Message state and draft persistence
  const messageInput = useMessageInput({
    conversationId,
    maxChars,
    onDraftLoaded: (draft) => {
      if (draft.trim().length) {
        const target = Math.min(
          autoHeight.maxHeight,
          Math.max(autoHeight.minHeight, autoHeight.inputHeight)
        );
        // Height will be adjusted on next content size change
      }
    },
  });

  // Mentions handling
  const mentions = useMentions({
    textInputRef,
    onMessageUpdate: messageInput.setMessage,
  });

  // Reply handling
  const reply = useReplyHandler({
    replyToMessage,
    onCancelReply,
  });

  // File picker
  const filePicker = useFilePicker({
    onFilesSelected: onOpenImagePicker,
    onOpenNativePicker: onOpenImagePickerNative,
  });

  // Combined change handler
  const handleChangeText = useCallback(
    (text: string) => {
      messageInput.handleChangeText(text);
      mentions.updateMentionQuery(text, mentions.cursorPosition);
      autoHeight.updateHeightForText(text);
    },
    [messageInput, mentions, autoHeight]
  );

  // Selection change handler
  const handleSelectionChange = useCallback(
    (e: TextInputSelectionChangeEvent) => {
      mentions.setCursorPosition(e.nativeEvent.selection.start);
    },
    [mentions]
  );

  // Send handler
  const handleSend = useCallback(
    (messageOverride?: string) => {
      const finalMessage = messageInput.handleSend(messageOverride);
      if (!finalMessage || disabled) return;

      onSendMessage(finalMessage, reply.replyToMessage || undefined);

      autoHeight.resetHeight();
      mentions.clearMention();

      if (reply.isReplying) {
        reply.handleCancelReply();
      }

      requestAnimationFrame(() => {
        textInputRef.current?.focus();
      });
    },
    [messageInput, disabled, onSendMessage, reply, autoHeight, mentions]
  );

  // Mention selection handler
  const handleSelectMention = useCallback(
    (participant: ConversationParticipant) => {
      const newText = mentions.handleSelectMention(participant, messageInput.message);
      messageInput.setMessage(newText);
    },
    [mentions, messageInput]
  );

  // Keyboard handlers
  const enterSubmitHandler = useEnterSubmit(() => handleSend(messageInput.message));
  const specialCharHandler = useSpecialCharHandler(messageInput.message, mentions.cursorPosition, {
    handlers: { "@": () => mentions.triggerMention() },
  });

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
    getPlaceholder: reply.getPlaceholder,

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
    placeholder: reply.getPlaceholder(placeholder),
    lineHeight,
    verticalPadding,
    maxChars,
  };
}
