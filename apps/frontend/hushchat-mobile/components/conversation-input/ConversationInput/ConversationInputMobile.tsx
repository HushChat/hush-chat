import React, { useCallback, useState } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import ReplyPreview from "@/components/conversations/conversation-thread/message-list/ReplyPreview";
import { EditPreview } from "@/components/conversation-input/EditPreview";
import MentionSuggestions from "@/components/conversations/conversation-thread/mentions/MentionSuggestions";
import MobileAttachmentModal from "@/components/conversations/MobileAttachmentModal";
import { ConversationInputProps } from "@/types/chat/types";
import { useConversationInput } from "@/hooks/conversation-input/useConversationInput";
import { AttachmentButton } from "@/components/conversation-input/AttachmentButton";
import { MessageTextArea } from "@/components/conversation-input/MessageTextArea";
import { EmojiPickerComponent } from "@/components/conversation-input/EmojiPicker";
import { useEmojiGifPicker } from "@/hooks/useEmojiGifPicker";
import { ConversationInputActions } from "@/components/conversation-input/ConversationInputActions";
import GifPicker from "@/components/conversation-input/GifPicker/GifPicker";
import { useWebSocket } from "@/contexts/WebSocketContext";

const ConversationInputMobile = ({
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
  controlledMarkdownEnabled,
  onControlledMarkdownChange,
  editingMessage,
  onCancelEdit,
  onEditMessage,
  hideEmojiGifPickers = false,
}: ConversationInputProps) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const isControlledMode = controlledValue !== undefined;
  const { publishTyping } = useWebSocket();

  const {
    showEmojiPicker,
    showGifPicker,
    openEmojiPicker,
    closeEmojiPicker,
    openGifPicker,
    closeGifPicker,
  } = useEmojiGifPicker();

  const input = useConversationInput({
    conversationId,
    onSendMessage,
    onOpenImagePickerNative,
    disabled,
    replyToMessage,
    onCancelReply,
    controlledValue,
    onControlledValueChange,
    onTypingStatusChange: (isTyping, convId) => {
      publishTyping({
        conversationId: convId,
        typing: isTyping,
      });
    },
    editingMessage,
    onCancelEdit,
    onEditMessage,
    controlledMarkdownEnabled,
    onControlledMarkdownChange,
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
      {input.isEditMode && input.editingMessage && (
        <EditPreview message={input.editingMessage} onCancelEdit={input.handleCancelEdit} />
      )}

      {input.replyToMessage && !input.isEditMode && (
        <ReplyPreview
          replyToMessage={input.replyToMessage}
          onCancelReply={input.handleCancelReply}
        />
      )}

      <View className="p-3 bg-background-light dark:bg-background-dark border-gray-200 dark:border-red-800">
        <Animated.View className="overflow-hidden">
          <View className="flex-row items-center rounded-3xl bg-gray-300/30 dark:bg-secondary-dark pl-1 pr-2 py-1">
            {!isControlledMode && !input.isEditMode && (
              <View className="mr-1">
                <AttachmentButton
                  ref={input.addButtonRef}
                  disabled={disabled}
                  toggled={mobileMenuVisible}
                  onPress={handleAddButtonPress}
                />
              </View>
            )}

            <View className="flex-1 px-2 min-h-[40px] justify-center">
              <MessageTextArea
                ref={input.messageTextInputRef}
                value={input.message}
                placeholder={input.placeholder}
                disabled={disabled}
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

            <ConversationInputActions
              isEditMode={input.isEditMode}
              hideEmojiGifPickers={hideEmojiGifPickers}
              hideSendButton={hideSendButton}
              disabled={disabled}
              isValidMessage={input.isValidMessage}
              isSending={isSending}
              onOpenEmojiPicker={openEmojiPicker}
              onOpenGifPicker={openGifPicker}
              onSendPress={handleSendButtonPress}
              isMarkdownEnabled={input.isMarkdownEnabled}
              onToggleMarkdown={() => input.setIsMarkdownEnabled((prev) => !prev)}
            />
          </View>
        </Animated.View>
      </View>

      {!isControlledMode && !input.isEditMode && (
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

      {!input.isEditMode && !hideEmojiGifPickers && (
        <>
          <EmojiPickerComponent
            visible={showEmojiPicker}
            onClose={closeEmojiPicker}
            onEmojiSelect={(emoji) => {
              input.handleChangeText(input.message + emoji);
            }}
          />

          <GifPicker
            visible={showGifPicker}
            onClose={closeGifPicker}
            onGifSelect={(gifUrl) => {
              onSendMessage?.("", false, replyToMessage ?? undefined, undefined, gifUrl);
            }}
          />
        </>
      )}
    </View>
  );
};

export default ConversationInputMobile;
