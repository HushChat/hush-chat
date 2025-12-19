import React, { memo, useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
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
import { FileInput } from "@/components/conversation-input/FileInput";
import { EmojiPickerComponent } from "@/components/conversation-input/EmojiPicker";
import { GifPickerComponent } from "@/components/conversation-input/GifPicker.web";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useEmojiGifPicker } from "@/hooks/useEmojiGifPicker";

const ConversationInput = ({
  conversationId,
  onSendMessage,
  onOpenImagePicker,
  disabled = false,
  isSending = false,
  replyToMessage,
  onCancelReply,
  isGroupChat,
  controlledValue,
  onControlledValueChange,
  hideSendButton = false,
}: ConversationInputProps) => {
  const isControlledMode = controlledValue !== undefined;

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
    onOpenImagePicker,
    disabled,
    replyToMessage,
    onCancelReply,
    controlledValue,
    onControlledValueChange,
  });

  const handleKeyPress = useCallback(
    (event: any) => {
      input.specialCharHandler(event);
      if (!hideSendButton) {
        input.enterSubmitHandler(event);
      }
    },
    [input.specialCharHandler, input.enterSubmitHandler, hideSendButton]
  );

  const handleSubmitEditing = useCallback(() => {
    if (!hideSendButton) {
      input.handleSend(input.message);
    }
  }, [input.handleSend, input.message, hideSendButton]);

  const handleSendPress = useCallback(() => {
    input.handleSend(input.message);
  }, [input.handleSend, input.message]);

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      input.handleChangeText(input.message + emoji);
    },
    [input.handleChangeText, input.message]
  );

  const handleGifSelect = useCallback(
    (gifUrl: string) => {
      onSendMessage?.("", undefined, undefined, gifUrl);
    },
    [onSendMessage]
  );

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
          "p-4 bg-background-light dark:bg-background-dark",
          "border-gray-200 dark:border-gray-800"
        )}
      >
        <View className="flex-row items-center rounded-3xl bg-gray-300/30 dark:bg-secondary-dark pl-1 pr-2 py-1">
          {!isControlledMode && (
            <View className="mr-1">
              <AttachmentButton
                ref={input.addButtonRef}
                disabled={disabled}
                toggled={input.menuVisible}
                onPress={input.handleAddButtonPress}
              />
            </View>
          )}

          <View className="flex-1 px-2 min-h-[40px] justify-center">
            <Animated.View style={input.animatedContainerStyle} className="overflow-hidden">
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
            </Animated.View>
          </View>

          <View className="flex-row items-center ml-1">
            <TouchableOpacity
              onPress={openEmojiPicker}
              className="p-1.5 justify-center items-center"
              disabled={disabled}
            >
              <MaterialIcons
                name="emoji-emotions"
                size={22}
                className="text-gray-500 dark:text-gray-400"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={openGifPicker}
              className="p-1.5 justify-center items-center"
              disabled={disabled}
            >
              <AntDesign name="gif" size={22} className="text-gray-500 dark:text-gray-400" />
            </TouchableOpacity>

            {!hideSendButton && (
              <View className="ml-1">
                <SendButton
                  showSend={input.isValidMessage}
                  isSending={isSending}
                  onPress={handleSendPress}
                />
              </View>
            )}
          </View>
        </View>

        {!isControlledMode && (
          <>
            <FileInput
              ref={input.fileInputRef}
              onChange={input.handleFileChange}
              accept="image/*"
            />
            <FileInput
              ref={input.documentInputRef}
              onChange={input.handleDocumentChange}
              accept={".pdf,.doc,.docx,.xls,.xlsx,.txt"}
            />
          </>
        )}
      </View>

      {!isControlledMode && (
        <WebChatContextMenu
          visible={input.menuVisible}
          position={input.menuPosition}
          onClose={input.closeMenu}
          options={input.menuOptions}
          onOptionSelect={input.handleMenuOptionSelect}
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
        onClose={closeEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
      />

      <GifPickerComponent
        visible={showGifPicker}
        onClose={closeGifPicker}
        onGifSelect={handleGifSelect}
      />
    </View>
  );
};

export default memo(ConversationInput);
