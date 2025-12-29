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
import { FileInput } from "@/components/conversation-input/FileInput";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { RecordingDisplayBar } from "@/components/conversation-input/RecordingDisplayBar";

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
  updateConversationMessagesCache,
}: ConversationInputProps & { updateConversationMessagesCache: (msg: any) => void }) => {
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

      {audio.isRecording && <RecordingDisplayBar audio={audio} />}

      <View
        className={classNames(
          "flex-row items-end p-4",
          "bg-background-light dark:bg-background-dark",
          "border-gray-200 dark:border-gray-800"
        )}
      >
        {!isControlledMode && (
          <AttachmentButton
            ref={input.addButtonRef}
            disabled={disabled || audio.isRecording}
            toggled={input.menuVisible}
            onPress={input.handleAddButtonPress}
          />
        )}

        <View className={classNames("flex-1", !isControlledMode && "mx-2")}>
          <Animated.View style={input.animatedContainerStyle} className="overflow-hidden">
            <View className="flex-row items-center rounded-3xl bg-gray-300/30 dark:bg-secondary-dark px-4">
              <MessageTextArea
                ref={input.messageTextInputRef}
                value={input.message}
                placeholder={input.placeholder}
                disabled={disabled || audio.isRecording}
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
                  isSending={isSending || audio.isRecordUploading}
                  isRecording={audio.isRecording}
                  onPress={handleSendPress}
                  onStartRecording={audio.handleStartRecording}
                  onStopRecording={audio.handleStopRecording}
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
              accept="image/*,video/*"
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
    </View>
  );
};

export default memo(ConversationInput);
