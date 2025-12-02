import React, { useCallback, ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import classNames from "classnames";
import ReplyPreview from "@/components/conversations/conversation-thread/message-list/ReplyPreview";
import MentionSuggestions from "@/components/conversations/conversation-thread/mentions/MentionSuggestions";
import { RIGHT_ICON_GUTTER } from "@/constants/composerConstants";
import { AttachmentButton } from "@/components/conversation-input/AttachmentButton";
import { MessageTextArea } from "@/components/conversation-input/MessageTextArea";
import { SendButton } from "@/components/conversation-input/SendButton";
import { CharacterCounter } from "@/components/conversation-input/CharacterCounter";
import { useConversationInput } from "@/hooks/conversation-input/useConversationInput";
import { ConversationInputProps } from "@/types/chat/types";

export interface ConversationInputBaseProps extends ConversationInputProps {
  containerPadding?: string;
  inputMargin?: string;
  inputPadding?: string;
  useAnimatedHeight?: boolean;
  extraContent?: ReactNode;
  afterContent?: ReactNode;
}

const ConversationInputBase = ({
  conversationId,
  onSendMessage,
  onOpenImagePicker,
  onOpenImagePickerNative,
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
  containerPadding = "p-4",
  inputMargin = "mx-4",
  inputPadding = "px-4",
  useAnimatedHeight = true,
  extraContent,
  afterContent,
}: ConversationInputBaseProps) => {
  const input = useConversationInput({
    conversationId,
    onSendMessage,
    onOpenImagePicker,
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

  const animatedStyle = useAnimatedHeight ? input.animatedContainerStyle : undefined;

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
          "flex-row items-end",
          containerPadding,
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

        <View className={classNames("flex-1", inputMargin)}>
          <Animated.View style={animatedStyle} className="overflow-hidden">
            <View
              className={classNames(
                "relative flex-row flex-end rounded-3xl",
                "bg-gray-300/30 dark:bg-secondary-dark",
                inputPadding
              )}
              style={styles.inputContainer}
            >
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

              <SendButton
                showSend={input.isValidMessage}
                isSending={isSending}
                onPress={input.handleSendButtonPress}
              />
            </View>

            {typeof maxChars === "number" && (
              <CharacterCounter currentLength={input.message.length} maxChars={maxChars} />
            )}
          </Animated.View>
        </View>

        {extraContent}
      </View>

      {afterContent}

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

export default ConversationInputBase;

const styles = StyleSheet.create({
  inputContainer: {
    paddingRight: RIGHT_ICON_GUTTER,
  },
});
