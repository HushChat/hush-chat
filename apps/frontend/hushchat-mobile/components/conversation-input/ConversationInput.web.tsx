import React, { memo, useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import classNames from "classnames";
import ReplyPreview from "@/components/conversations/conversation-thread/message-list/ReplyPreview";
import MentionSuggestions from "@/components/conversations/conversation-thread/mentions/MentionSuggestions";
import WebChatContextMenu from "@/components/WebContextMenu";
import { RIGHT_ICON_GUTTER } from "@/constants/composerConstants";
import { ConversationInputProps } from "@/types/chat/types";
import { useConversationInput } from "@/hooks/conversation-input/useConversationInput";
import { AttachmentButton } from "@/components/conversation-input/AttachmentButton";
import { MessageTextArea } from "@/components/conversation-input/MessageTextArea";
import { SendButton } from "@/components/conversation-input/SendButton";
import { FileInput } from "@/components/conversation-input/FileInput";
import { EmojiPickerComponent } from "@/components/conversation-input/EmojiPicker";
import { GifPickerComponent } from "@/components/conversation-input/GifPicker.web";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showGifPicker, setShowGifPicker] = useState<boolean>(false);
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

  const isControlledMode = controlledValue !== undefined;

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
          "flex-row items-end p-4 gap-x-2",
          "bg-background-light dark:bg-background-dark",
          "border-gray-200 dark:border-gray-800"
        )}
      >
        {!isControlledMode && (
          <AttachmentButton
            ref={input.addButtonRef}
            disabled={disabled}
            toggled={input.menuVisible}
            onPress={input.handleAddButtonPress}
          />
        )}
        <TouchableOpacity
          onPress={() => setShowEmojiPicker(true)}
          style={{ padding: 8 }}
          disabled={disabled}
        >
          <MaterialIcons
            name="emoji-emotions"
            size={24}
            className="text-gray-500 dark:text-gray-400"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowGifPicker(true)}
          style={{ padding: 8, marginLeft: 4 }}
          disabled={disabled}
        >
          <AntDesign name="gif" size={24} className="text-gray-500 dark:text-gray-400" />
        </TouchableOpacity>

        <View className={classNames("flex-1", !isControlledMode && "mx-4")}>
          <Animated.View style={input.animatedContainerStyle} className="overflow-hidden">
            <View
              className="relative flex-row flex-end rounded-3xl bg-gray-300/30 dark:bg-secondary-dark px-4"
              style={{ paddingRight: hideSendButton ? 16 : RIGHT_ICON_GUTTER }}
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
                <SendButton
                  showSend={input.isValidMessage}
                  isSending={isSending}
                  onPress={handleSendPress}
                />
              )}
            </View>
          </Animated.View>
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

export default memo(ConversationInput);
