import React, { memo, useCallback, forwardRef } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";
import classNames from "classnames";

import ReplyPreview from "@/components/conversations/conversation-thread/message-list/ReplyPreview";
import MentionSuggestions from "@/components/conversations/conversation-thread/mentions/MentionSuggestions";
import WebChatContextMenu from "@/components/WebContextMenu";
import { EditPreview } from "@/components/conversation-input/EditPreview";

import { ConversationInputProps } from "@/types/chat/types";
import { useConversationInput } from "@/hooks/conversation-input/useConversationInput";

import { AttachmentButton } from "@/components/conversation-input/AttachmentButton";
import { MessageTextArea } from "@/components/conversation-input/MessageTextArea";
import { FileInput } from "@/components/conversation-input/FileInput";
import { EmojiPickerComponent } from "@/components/conversation-input/EmojiPicker";
import { useEmojiGifPicker } from "@/hooks/useEmojiGifPicker";
import { ConversationInputActions } from "@/components/conversation-input/ConversationInputActions";
import GifPicker from "@/components/conversation-input/GifPicker/GifPicker";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { VoiceRecorderUI } from "@/components/conversation-input/VoiceRecorderUI";

const ConversationInputWeb = forwardRef<HTMLTextAreaElement, ConversationInputProps>(
  (
    {
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
      controlledMarkdownEnabled,
      onControlledMarkdownChange,
      editingMessage,
      onCancelEdit,
      onEditMessage,
      hideEmojiGifPickers = false,
      onSendVoiceMessage,
    },
    ref
  ) => {
    const { publishTyping } = useWebSocket();
    const isControlledMode = controlledValue !== undefined;
    const voiceRecorder = useVoiceRecorder();

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

    const handleKeyPress = useCallback(
      (event: any) => {
        input.specialCharHandler(event);
        input.enterSubmitHandler(event);
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
        onSendMessage?.("", false, replyToMessage ?? undefined, undefined, gifUrl);
      },
      [onSendMessage]
    );

    const handleMicPress = useCallback(() => {
      voiceRecorder.startRecording();
    }, [voiceRecorder.startRecording]);

    const handleVoiceSend = useCallback(async () => {
      const file = await voiceRecorder.stopRecording();
      if (file && onSendVoiceMessage) {
        await onSendVoiceMessage(file);
      }
    }, [voiceRecorder.stopRecording, onSendVoiceMessage]);

    const handleVoiceCancel = useCallback(() => {
      voiceRecorder.cancelRecording();
    }, [voiceRecorder.cancelRecording]);

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

        <View
          className={classNames(
            "p-4 bg-background-light dark:bg-background-dark",
            "border-gray-200 dark:border-gray-800"
          )}
        >
          {voiceRecorder.state.isRecording || voiceRecorder.state.isPreparing ? (
            <VoiceRecorderUI
              durationMs={voiceRecorder.state.durationMs}
              onCancel={handleVoiceCancel}
              onStop={handleVoiceSend}
              isSending={isSending}
            />
          ) : (
            <View className="flex-row items-center rounded-3xl bg-gray-300/30 dark:bg-secondary-dark pl-1 pr-2 py-1">
              {!isControlledMode && !input.isEditMode && (
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
                    ref={(node) => {
                      input.messageTextInputRef.current = node;
                      if (typeof ref === "function") {
                        ref(node as any);
                      } else if (ref) {
                        ref.current = node as any;
                      }
                    }}
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
                    validMentionUsernames={input.validMentionUsernames}
                  />
                </Animated.View>
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
                onSendPress={handleSendPress}
                isMarkdownEnabled={input.isMarkdownEnabled}
                onToggleMarkdown={() => input.setIsMarkdownEnabled((prev) => !prev)}
                onMicPress={onSendVoiceMessage ? handleMicPress : undefined}
                isRecording={voiceRecorder.state.isRecording}
              />
            </View>
          )}

          {!isControlledMode && !input.isEditMode && (
            <>
              <FileInput
                ref={input.fileInputRef}
                onChange={input.handleFileChange}
                accept="image/*,video/*"
              />
              <FileInput
                ref={input.documentInputRef}
                onChange={input.handleDocumentChange}
                accept="*"
              />
            </>
          )}
        </View>

        {!isControlledMode && !input.isEditMode && (
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

        {!input.isEditMode && !hideEmojiGifPickers && (
          <>
            <EmojiPickerComponent
              visible={showEmojiPicker}
              onClose={closeEmojiPicker}
              onEmojiSelect={handleEmojiSelect}
            />

            <GifPicker
              visible={showGifPicker}
              onClose={closeGifPicker}
              onGifSelect={handleGifSelect}
            />
          </>
        )}
      </View>
    );
  }
);

ConversationInputWeb.displayName = "ConversationInputWeb";

export default memo(ConversationInputWeb);
