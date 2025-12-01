/**
 * ConversationInput.native
 *
 * Native (iOS/Android) implementation of the conversation input bar.
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import classNames from "classnames";
import ReplyPreview from "@/components/conversations/conversation-thread/message-list/ReplyPreview";
import MentionSuggestions from "@/components/conversations/conversation-thread/mentions/MentionSuggestions";
import { PLATFORM } from "@/constants/platformConstants";
import { RIGHT_ICON_GUTTER } from "@/constants/composerConstants";
import { ConversationInputProps } from "@/types/chat/types";
import { useConversationInput } from "@/hooks/conversation-input/useConversationInput";
import { AttachmentButton } from "@/components/conversation-input/AttachmentButton";
import { MessageTextArea } from "@/components/conversation-input/MessageTextArea";
import { SendButton } from "@/components/conversation-input/SendButton";
import { CharacterCounter } from "@/components/conversation-input/CharacterCounter";

const ConversationInput: React.FC<ConversationInputProps> = ({
  conversationId,
  onSendMessage,
  onOpenImagePickerNative,
  disabled = false,
  isSending = false,
  placeholder = "Type a message...",
  minLines = 1,
  maxLines = 6,
  lineHeight = 22,
  verticalPadding = PLATFORM.IS_ANDROID ? 20 : 12,
  maxChars,
  autoFocus = false,
  replyToMessage,
  onCancelReply,
  isGroupChat,
}) => {
  const input = useConversationInput({
    conversationId,
    onSendMessage,
    onOpenImagePickerNative,
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
          "flex-row items-end p-3",
          "bg-background-light dark:bg-background-dark",
          "border-gray-200 dark:border-gray-800"
        )}
      >
        <AttachmentButton
          ref={input.addButtonRef}
          disabled={disabled}
          onPress={input.handleAddButtonPress}
        />

        <View className="flex-1 mx-3">
          <Animated.View style={input.animatedContainerStyle} className="overflow-hidden">
            <View
              className="flex-row rounded-3xl bg-gray-300/30 dark:bg-secondary-dark px-3"
              style={styles.inputContainer}
            >
              <MessageTextArea
                ref={input.textInputRef}
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
                onKeyPress={(e) => {
                  input.specialCharHandler(e);
                  input.enterSubmitHandler(e);
                }}
                onSubmitEditing={() => input.handleSend(input.message)}
              />

              <SendButton
                showSend={input.isValidMessage}
                isSending={isSending}
                onPress={() => input.handleSend(input.message)}
              />
            </View>

            {typeof maxChars === "number" && (
              <CharacterCounter currentLength={input.message.length} maxChars={maxChars} />
            )}
          </Animated.View>
        </View>
      </View>

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

export default ConversationInput;

const styles = StyleSheet.create({
  inputContainer: {
    position: "relative",
    alignItems: "flex-end",
    paddingRight: RIGHT_ICON_GUTTER,
  },
});
