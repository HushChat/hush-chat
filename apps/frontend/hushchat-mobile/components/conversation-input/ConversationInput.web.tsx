import React, { memo, useCallback } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import classNames from "classnames";

import ReplyPreview from "@/components/conversations/conversation-thread/message-list/ReplyPreview";
import MentionSuggestions from "@/components/conversations/conversation-thread/mentions/MentionSuggestions";
import WebChatContextMenu from "@/components/WebContextMenu";

import { ConversationInputProps } from "@/types/chat/types";
import { useConversationInput } from "@/hooks/conversation-input/useConversationInput";

import { AttachmentButton } from "@/components/conversation-input/AttachmentButton";
import { MessageTextArea } from "@/components/conversation-input/MessageTextArea";
import { SendButton } from "@/components/conversation-input/SendButton";
import { CharacterCounter } from "@/components/conversation-input/CharacterCounter";
import { FileInput } from "@/components/conversation-input/FileInput";
import { MarkdownToggle } from "@/components/conversation-input/MarkdownToggle";

import { useConversationStore } from "@/store/conversation/useConversationStore";

const ConversationInput = ({
  conversationId,
  onSendMessage,
  onOpenImagePicker,
  disabled = false,
  isSending = false,
  placeholder = "Type a message...",
  minLines = 1,
  maxLines = 6,
  lineHeight = 22,
  verticalPadding = 12,
  maxChars,
  autoFocus = false,
  replyToMessage,
  onCancelReply,
  isGroupChat,
}: ConversationInputProps) => {
  const { isMarkdownEnabled, toggleMarkdown } = useConversationStore();

  const input = useConversationInput({
    conversationId,
    onSendMessage,
    onOpenImagePicker,
    disabled,
    replyToMessage,
    onCancelReply,
    maxChars,
    minLines,
    maxLines,
    lineHeight,
    verticalPadding,
    placeholder,
  });

  const handleKeyPress = useCallback(
    (event: any) => {
      input.specialCharHandler(event);
      input.enterSubmitHandler(event);
    },
    [input.specialCharHandler, input.enterSubmitHandler]
  );

  const handleSubmitEditing = useCallback(() => {
    input.handleSend(input.message);
  }, [input.handleSend, input.message]);

  const handleSendPress = useCallback(() => {
    input.handleSend(input.message);
  }, [input.handleSend, input.message]);

  return (
    <View>
      {input.replyToMessage && (
        <ReplyPreview
          replyToMessage={input.replyToMessage}
          onCancelReply={input.handleCancelReply}
        />
      )}

      <View
        className={classNames(
          "flex-row items-end p-4",
          "bg-background-light dark:bg-background-dark",
          "border-gray-200 dark:border-gray-800"
        )}
      >
        <AttachmentButton
          ref={input.addButtonRef}
          disabled={disabled}
          toggled={input.menuVisible}
          onPress={input.handleAddButtonPress}
        />

        <View className="flex-1 mx-2">
          <Animated.View style={input.animatedContainerStyle} className="overflow-hidden">
            <View className="flex-row items-center rounded-3xl bg-gray-300/30 dark:bg-secondary-dark px-4">
              <MessageTextArea
                ref={input.messageTextInputRef}
                value={input.message}
                placeholder={input.placeholder}
                disabled={disabled}
                autoFocus={autoFocus}
                minHeight={input.minHeight}
                maxHeight={input.maxHeight}
                inputHeight={input.inputHeight}
                lineHeight={lineHeight}
                verticalPadding={verticalPadding}
                onChangeText={input.handleChangeText}
                onContentSizeChange={input.handleContentSizeChange}
                onSelectionChange={input.handleSelectionChange}
                onKeyPress={handleKeyPress}
                onSubmitEditing={handleSubmitEditing}
              />
              <View className="flex-row items-center gap-3">
                <MarkdownToggle
                  enabled={isMarkdownEnabled}
                  onToggle={toggleMarkdown}
                  disabled={disabled}
                />

                <SendButton
                  showSend={input.isValidMessage}
                  isSending={isSending}
                  onPress={handleSendPress}
                />
              </View>
            </View>

            {typeof maxChars === "number" && (
              <CharacterCounter currentLength={input.message.length} maxChars={maxChars} />
            )}
          </Animated.View>
        </View>

        <FileInput ref={input.fileInputRef} onChange={input.handleFileChange} accept="image/*" />

        <FileInput
          ref={input.documentInputRef}
          onChange={input.handleDocumentChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
      </View>

      <WebChatContextMenu
        visible={input.menuVisible}
        position={input.menuPosition}
        onClose={input.closeMenu}
        options={input.menuOptions}
        onOptionSelect={input.handleMenuOptionSelect}
      />

      {isGroupChat && input.mentionVisible && (
        <MentionSuggestions
          conversationId={conversationId}
          mentionQuery={input.mentionQuery}
          onSelect={input.handleSelectMention}
        />
      )}
    </View>
  );
};

export default memo(ConversationInput);
