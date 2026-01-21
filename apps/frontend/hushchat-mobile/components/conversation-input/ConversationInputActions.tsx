import React, { memo, ReactNode } from "react";
import { TouchableOpacity, View } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

import { SendButton } from "@/components/conversation-input/SendButton";
import { MarkdownToggle } from "@/components/conversation-input/MarkdownToggle";

interface IComposerIconButtonProps {
  onPress: () => void;
  disabled?: boolean;
  children: ReactNode;
}

const ComposerIconButton = ({ onPress, disabled, children }: IComposerIconButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className="p-1.5 justify-center items-center"
    >
      {children}
    </TouchableOpacity>
  );
};

interface IConversationInputActionProps {
  isEditMode: boolean;
  hideEmojiGifPickers?: boolean;
  hideSendButton?: boolean;
  disabled?: boolean;
  isValidMessage: boolean;
  isSending: boolean;
  onOpenEmojiPicker: () => void;
  onOpenGifPicker: () => void;
  onSendPress: () => void;
  isMarkdownEnabled: boolean;
  onToggleMarkdown: () => void;
}

export const ConversationInputActions = memo(
  ({
    isEditMode,
    hideEmojiGifPickers,
    hideSendButton,
    disabled,
    isValidMessage,
    isSending,
    onOpenEmojiPicker,
    onOpenGifPicker,
    onSendPress,
    isMarkdownEnabled,
    onToggleMarkdown,
  }: IConversationInputActionProps) => {
    return (
      <View className="flex-row gap-2 items-center ml-1">
        {!isEditMode && !hideEmojiGifPickers && (
          <>
            <ComposerIconButton onPress={onOpenEmojiPicker} disabled={disabled}>
              <MaterialIcons
                name="emoji-emotions"
                size={22}
                className="text-gray-500 dark:text-gray-400"
              />
            </ComposerIconButton>

            <ComposerIconButton onPress={onOpenGifPicker} disabled={disabled}>
              <AntDesign name="gif" size={22} className="text-gray-500 dark:text-gray-400" />
            </ComposerIconButton>
          </>
        )}

        {isValidMessage && (
          <View className="ml-1">
            <MarkdownToggle enabled={isMarkdownEnabled} onToggle={onToggleMarkdown} />
          </View>
        )}

        {!hideSendButton && (
          <View className="ml-1">
            <SendButton showSend={isValidMessage} isSending={isSending} onPress={onSendPress} />
          </View>
        )}
      </View>
    );
  }
);

ConversationInputActions.displayName = "ConversationInputActions";
