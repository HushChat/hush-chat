import React from "react";
import { Pressable, View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { IMessage, IMessageAttachment } from "@/types/chat/types";
import FormattedText from "@/components/FormattedText";
import UnsendMessagePreview from "@/components/UnsendMessagePreview";
import { ForwardedLabel } from "@/components/conversations/conversation-thread/composer/ForwardedLabel";
import { renderFileGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/renderFileGrid";
import { getSelectionIconPosition, getBubbleBorderStyle } from "@/utils/messageStyles";

interface MessageBubbleProps {
  message: IMessage;
  isCurrentUser: boolean;
  hasText: boolean;
  hasAttachments: boolean;
  hasImages: boolean;
  selected: boolean;
  selectionMode: boolean;
  isForwardedMessage: boolean;
  attachments: IMessageAttachment[];
  onBubblePress: () => void;
  style?: ViewStyle | ViewStyle[];
  messageTextStyle?: TextStyle;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  hasText,
  hasAttachments,
  hasImages,
  selected,
  selectionMode,
  isForwardedMessage,
  attachments,
  onBubblePress,
  style,
  messageTextStyle,
}) => {
  const messageContent = message.messageText;

  return (
    <Pressable onPress={onBubblePress} disabled={!messageContent && !hasAttachments}>
      {selectionMode && (
        <View style={getSelectionIconPosition(isCurrentUser)}>
          <Ionicons
            name={selected ? "checkmark-circle" : "ellipse-outline"}
            size={20}
            color={selected ? "#3B82F6" : "#9CA3AF"}
          />
        </View>
      )}

      <View className={classNames("rounded-xl", isCurrentUser ? "items-end" : "items-start")}>
        <ForwardedLabel isForwardedMessage={isForwardedMessage} isCurrentUser={isCurrentUser} />

        <View
          className={classNames(
            "rounded-lg border-2",
            hasText || hasImages
              ? isCurrentUser
                ? "bg-primary-light dark:bg-primary-dark rounded-tr-none"
                : "bg-secondary-light dark:bg-secondary-dark rounded-tl-none"
              : "bg-transparent",
            selected && selectionMode ? "border-sky-500 dark:border-sky-400" : "border-transparent",
            isForwardedMessage && "shadow-sm",
            hasImages && !messageContent ? "" : "px-3 py-2"
          )}
          style={[style, getBubbleBorderStyle(isForwardedMessage, isCurrentUser)]}
        >
          {hasAttachments && (
            <View className={messageContent ? "mb-2" : ""}>
              {renderFileGrid(attachments, isCurrentUser)}
            </View>
          )}

          {!message.isUnsend && messageContent ? (
            <FormattedText
              text={message.messageText}
              style={messageTextStyle || styles.messageText}
              mentions={message.mentions}
              isCurrentUser={isCurrentUser}
            />
          ) : message.isUnsend ? (
            <UnsendMessagePreview unsendMessage={message} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },
});
