import React, { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import ReplyPreview from "@/components/conversations/conversation-thread/message-list/ReplyPreview";
import MentionSuggestions from "@/components/conversations/conversation-thread/mentions/MentionSuggestions";
import MobileAttachmentModal from "@/components/conversations/MobileAttachmentModal";
import { ConversationInputProps } from "@/types/chat/types";
import { useConversationInput } from "@/hooks/conversation-input/useConversationInput";
import { AttachmentButton } from "@/components/conversation-input/AttachmentButton";
import { MessageTextArea } from "@/components/conversation-input/MessageTextArea";
import { SendButton } from "@/components/conversation-input/SendButton";

const ConversationInput = ({
  conversationId,
  onSendMessage,
  onOpenImagePickerNative,
  onOpenDocumentPickerNative,
  disabled = false,
  isSending = false,
  replyToMessage,
  onCancelReply,
  isGroupChat,
  controlledValue,
  onControlledValueChange,
  hideSendButton = false,
}: ConversationInputProps) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const isControlledMode = controlledValue !== undefined;

  const input = useConversationInput({
    conversationId,
    onSendMessage,
    onOpenImagePickerNative,
    disabled,
    replyToMessage,
    onCancelReply,
    controlledValue,
    onControlledValueChange,
  });

  const handleAddButtonPress = useCallback(() => {
    setMobileMenuVisible(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuVisible(false);
  }, []);

  const handleMediaPickerSelect = useCallback(() => {
    setMobileMenuVisible(false);

    setTimeout(() => {
      onOpenImagePickerNative?.();
    }, 500);
  }, [onOpenImagePickerNative]);

  const handleDocumentPickerSelect = useCallback(() => {
    setMobileMenuVisible(false);

    setTimeout(() => {
      onOpenDocumentPickerNative?.();
    }, 800);
  }, [onOpenDocumentPickerNative]);

  const handleSendButtonPress = useCallback(() => {
    if (!hideSendButton) {
      input.handleSend();
    }
  }, [input.handleSend, hideSendButton]);

  const handleSubmitEditing = useCallback(() => {
    if (!hideSendButton) {
      input.handleSend();
    }
  }, [input.handleSend, hideSendButton]);

  const handleKeyPress = useCallback(
    (e: any) => {
      input.specialCharHandler(e);
      if (!hideSendButton) {
        input.enterSubmitHandler(e);
      }
    },
    [input.specialCharHandler, input.enterSubmitHandler, hideSendButton]
  );

  return (
    <View>
      {input.replyToMessage && (
        <ReplyPreview
          replyToMessage={input.replyToMessage}
          onCancelReply={input.handleCancelReply}
        />
      )}

      <View className="flex-row items-end p-3 bg-background-light dark:bg-background-dark border-gray-200 dark:border-gray-800">
        {!isControlledMode && (
          <AttachmentButton
            ref={input.addButtonRef}
            disabled={disabled}
            toggled={mobileMenuVisible}
            onPress={handleAddButtonPress}
          />
        )}

        <View className={isControlledMode ? "flex-1" : "flex-1 mx-3"}>
          <Animated.View style={input.animatedContainerStyle} className="overflow-hidden">
            <View
              className="flex-row rounded-3xl bg-gray-300/30 dark:bg-secondary-dark px-3"
              style={[styles.inputContainer, hideSendButton && { paddingRight: 16 }]}
            >
              <MessageTextArea
                ref={input.messageTextInputRef}
                value={input.message}
                placeholder={input.placeholder}
                disabled={disabled}
                autoFocus
                minHeight={input.minHeight}
                maxHeight={input.maxHeight}
                inputHeight={input.inputHeight}
                lineHeight={22}
                verticalPadding={12}
                onChangeText={input.handleChangeText}
                onContentSizeChange={input.handleContentSizeChange}
                onSelectionChange={input.handleSelectionChange}
                onKeyPress={handleKeyPress}
                onSubmitEditing={handleSubmitEditing}
              />

              {!hideSendButton && (
                <View className="mb-4">
                  <SendButton
                    showSend={input.isValidMessage}
                    isSending={isSending}
                    onPress={handleSendButtonPress}
                  />
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </View>

      {!isControlledMode && (
        <MobileAttachmentModal
          visible={mobileMenuVisible}
          onClose={handleCloseMobileMenu}
          onOpenMediaPicker={handleMediaPickerSelect}
          onOpenDocumentPicker={handleDocumentPickerSelect}
        />
      )}

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
  },
});
