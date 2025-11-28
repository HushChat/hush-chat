import React from "react";
import { Pressable, View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { IMessage, IMessageAttachment } from "@/types/chat/types";
import FormattedText from "@/components/FormattedText";
import UnsendMessagePreview from "@/components/UnsendMessagePreview";
import { ForwardedLabel } from "@/components/conversations/conversation-thread/composer/ForwardedLabel";
import { renderFileGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/renderFileGrid";
import { useMessageUrlMetadataQuery } from "@/query/useMessageUrlMetadataQuery";
import { PLATFORM } from "@/constants/platformConstants";
import LinkPreviewCard from "@/components/conversations/LinkPreviewCard";

const COLORS = {
  FORWARDED_RIGHT_BORDER: "#60A5FA30",
  FORWARDED_LEFT_BORDER: "#9CA3AF30",
};

interface IMessageBubbleProps {
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

export const MessageBubble: React.FC<IMessageBubbleProps> = ({
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

  const forwardedBorderStyle = isForwardedMessage
    ? isCurrentUser
      ? styles.forwardedRight
      : styles.forwardedLeft
    : null;

  const bubbleMaxWidthStyle = hasAttachments
    ? styles.maxWidthAttachments
    : !PLATFORM.IS_WEB
      ? styles.maxWidthRegular
      : styles.maxWidthWebForLink;

  const { messageUrlMetadata, isMessageUrlMetadataLoading } = useMessageUrlMetadataQuery(
    message.id,
    message.isIncludeUrlMetadata
  );

  return (
    <Pressable onPress={onBubblePress} disabled={!messageContent && !hasAttachments}>
      {selectionMode && (
        <View
          className={classNames("absolute -top-1.5 z-10", {
            "-right-1.5": isCurrentUser,
            "-left-1.5": !isCurrentUser,
          })}
        >
          <Ionicons
            name={selected ? "checkmark-circle" : "ellipse-outline"}
            size={20}
            color={selected ? "#3B82F6" : "#9CA3AF"}
          />
        </View>
      )}

      <View
        className={classNames("rounded-xl", isCurrentUser ? "items-end" : "items-start")}
        style={style}
      >
        <ForwardedLabel isForwardedMessage={isForwardedMessage} isCurrentUser={isCurrentUser} />

        <View
          className={classNames("rounded-lg border-2", {
            "bg-primary-light dark:bg-primary-dark rounded-tr-none":
              (hasText || hasImages) && isCurrentUser,
            "bg-secondary-light dark:bg-secondary-dark rounded-tl-none":
              (hasText || hasImages) && !isCurrentUser,
            "bg-transparent": !(hasText || hasImages),

            "border-sky-500 dark:border-sky-400": selected && selectionMode,
            "border-transparent": !(selected && selectionMode),

            "shadow-sm": isForwardedMessage,

            "px-3 py-2": !(messageContent && !hasImages && messageUrlMetadata),
            "p-1": messageUrlMetadata,
          })}
          style={[bubbleMaxWidthStyle, forwardedBorderStyle]}
        >
          {hasAttachments && (
            <View className={messageContent ? "mb-2" : ""}>
              {renderFileGrid(attachments, isCurrentUser)}
            </View>
          )}

          {!message.isUnsend && !message.isIncludeUrlMetadata && messageContent ? (
            <FormattedText
              text={message.messageText}
              style={messageTextStyle || styles.messageText}
              mentions={message.mentions}
              isCurrentUser={isCurrentUser}
            />
          ) : !message.isUnsend && message.isIncludeUrlMetadata && messageContent ? (
            <LinkPreviewCard
              messageText={message.messageText}
              messageUrlMetadata={messageUrlMetadata}
              isLoading={isMessageUrlMetadataLoading}
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
  maxWidthAttachments: {
    maxWidth: 305,
  },
  maxWidthRegular: {
    maxWidth: "70%",
  },
  maxWidthWebForLink: {
    maxWidth: "40%",
  },
  forwardedRight: {
    borderRightWidth: 2,
    borderRightColor: COLORS.FORWARDED_RIGHT_BORDER,
  },
  forwardedLeft: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.FORWARDED_LEFT_BORDER,
  },
});
