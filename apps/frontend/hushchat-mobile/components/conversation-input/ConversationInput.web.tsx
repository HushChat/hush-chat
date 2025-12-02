import React, { memo, useCallback } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import ReplyPreview from "@/components/conversations/conversation-thread/message-list/ReplyPreview";
import MentionSuggestions from "@/components/conversations/conversation-thread/mentions/MentionSuggestions";
import WebChatContextMenu from "@/components/WebContextMenu";
import { RIGHT_ICON_GUTTER } from "@/constants/composerConstants";
import { ConversationInputProps } from "@/types/chat/types";
import { useConversationInput } from "@/hooks/conversation-input/useConversationInput";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { AttachmentButton } from "@/components/conversation-input/AttachmentButton";
import { MessageTextArea } from "@/components/conversation-input/MessageTextArea";
import { SendButton } from "@/components/conversation-input/SendButton";
import { CharacterCounter } from "@/components/conversation-input/CharacterCounter";
import { FileInput } from "@/components/conversation-input/FileInput";
import { AppText } from "@/components/AppText";

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
  updateConversationMessagesCache,
}: ConversationInputProps & { updateConversationMessagesCache: (msg: any) => void }) => {
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

  const audio = useAudioRecording({
    conversationId,
    message: input.message,
    replyToMessage,
    onCancelReply,
    updateConversationMessagesCache,
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

      {audio.isRecording && (
        <View className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-gray-200 dark:border-gray-800">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
              <AppText className="text-red-600 dark:text-red-400 font-medium">
                Recording {audio.formatDuration(audio.recordingDuration)}
              </AppText>
            </View>
            <Ionicons
              name="close-circle"
              size={24}
              color="#EF4444"
              onPress={audio.handleCancelRecording}
            />
          </View>
        </View>
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
          disabled={disabled || audio.isRecording}
          toggled={input.menuVisible}
          onPress={input.handleAddButtonPress}
        />

        <View className="flex-1 mx-4">
          <Animated.View style={input.animatedContainerStyle} className="overflow-hidden">
            <View
              className="relative flex-row flex-end rounded-3xl bg-gray-300/30 dark:bg-secondary-dark px-4"
              style={{ paddingRight: RIGHT_ICON_GUTTER }}
            >
              <MessageTextArea
                ref={input.messageTextInputRef}
                value={input.message}
                placeholder={input.placeholder}
                disabled={disabled || audio.isRecording}
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
                isSending={isSending || audio.isRecordUploading}
                isRecording={audio.isRecording}
                onPress={handleSendPress}
                onStartRecording={audio.handleStartRecording}
                onStopRecording={audio.handleStopRecording}
              />
            </View>

            {typeof maxChars === "number" && (
              <CharacterCounter currentLength={input.message.length} maxChars={maxChars} />
            )}
          </Animated.View>
        </View>

        <FileInput ref={input.fileInputRef} onChange={input.handleFileChange} />
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
