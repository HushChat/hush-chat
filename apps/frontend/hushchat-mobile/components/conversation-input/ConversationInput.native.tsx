import React, { useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import ReplyPreview from "@/components/conversations/conversation-thread/message-list/ReplyPreview";
import MentionSuggestions from "@/components/conversations/conversation-thread/mentions/MentionSuggestions";
import MobileAttachmentModal from "@/components/conversations/MobileAttachmentModal";
import { ConversationInputProps } from "@/types/chat/types";
import { useConversationInput } from "@/hooks/conversation-input/useConversationInput";
import { AttachmentButton } from "@/components/conversation-input/AttachmentButton";
import { MessageTextArea } from "@/components/conversation-input/MessageTextArea";
import { SendButton } from "@/components/conversation-input/SendButton";
import { EmojiPickerComponent } from "@/components/conversation-input/EmojiPicker";
import { GifPickerComponent } from "@/components/conversation-input/GifPicker.native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showGifPicker, setShowGifPicker] = useState<boolean>(false);

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

  const handleImagePickerSelect = useCallback(() => {
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

      <View className="flex-row items-center mr-2 p-3 bg-background-light dark:bg-background-dark border-gray-200 dark:border-gray-800">
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
              className="flex-row items-center rounded-3xl bg-gray-300/30 dark:bg-secondary-dark px-3"
              style={[styles.inputContainer, hideSendButton && { paddingRight: 16 }]}
            >
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setShowEmojiPicker(true)}
                  style={{ padding: 6 }}
                  disabled={disabled}
                >
                  <MaterialIcons name="emoji-emotions" size={22} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowGifPicker(true)}
                  style={{ padding: 6 }}
                  disabled={disabled}
                >
                  <AntDesign name="gif" size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View className="flex-1 mx-2">
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
              </View>

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
          onOpenImagePicker={handleImagePickerSelect}
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
      <EmojiPickerComponent
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={(emoji) => {
          input.handleChangeText(input.message + emoji);
        }}
      />

      <GifPickerComponent
        visible={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onGifSelect={(gifUrl) => {
          onSendMessage?.("", undefined, undefined, gifUrl);
        }}
      />
    </View>
  );
};

export default ConversationInput;

const styles = StyleSheet.create({
  inputContainer: {
    position: "relative",
    alignItems: "center",
  },
});
