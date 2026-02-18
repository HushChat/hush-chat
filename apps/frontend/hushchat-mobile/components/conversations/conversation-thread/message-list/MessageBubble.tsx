import React, { useCallback } from "react";
import { Pressable, View, ViewStyle, TextStyle, Image, StyleSheet } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { IMessage, IMessageAttachment } from "@/types/chat/types";
import FormattedText from "@/components/FormattedText";
import UnsendMessagePreview from "@/components/UnsendMessagePreview";
import { MessageLabel } from "@/components/conversations/conversation-thread/composer/MessageLabel";
import { renderFileGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/renderFileGrid";
import { TUser } from "@/types/user/types";
import { useMessageUrlMetadataQuery } from "@/query/useMessageUrlMetadataQuery";
import { PLATFORM } from "@/constants/platformConstants";
import LinkPreviewCard from "@/components/conversations/LinkPreviewCard";
import { getGifUrl, hasGif } from "@/utils/messageUtils";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import { formatDateTime } from "@/utils/commonUtils";
import { useAppTheme } from "@/hooks/useAppTheme";

interface IMessageBubbleProps {
  message: IMessage;
  currentUserId: string;
  isCurrentUser: boolean;
  hasText: boolean;
  hasAttachments: boolean;
  hasMedia: boolean;
  selected: boolean;
  selectionMode: boolean;
  isForwardedMessage: boolean;
  attachments: IMessageAttachment[];
  onBubblePress: () => void;
  onMentionClick?: (user: TUser) => void;
  style?: ViewStyle | ViewStyle[];
  messageTextStyle?: TextStyle;
  isMessageEdited?: boolean;
  isMobileLayout?: boolean;
  isGroup?: boolean;
  messageTime?: string;
  isRead?: boolean;
  showTail?: boolean;
}

const BubbleTail = ({ isCurrentUser, isDark }: { isCurrentUser: boolean; isDark: boolean }) => {
  const color = isCurrentUser ? (isDark ? "#563dc4" : "#6B4EFF") : isDark ? "#1E2840" : "#F0EDFF";

  return (
    <View
      style={[bubbleStyles.tail, isCurrentUser ? bubbleStyles.tailRight : bubbleStyles.tailLeft]}
    >
      <View
        style={[
          bubbleStyles.tailTriangle,
          { borderBottomColor: color },
          isCurrentUser ? bubbleStyles.tailTriangleRight : bubbleStyles.tailTriangleLeft,
        ]}
      />
    </View>
  );
};

export const MessageBubble = ({
  message,
  currentUserId,
  isCurrentUser,
  hasText,
  hasAttachments,
  hasMedia,
  selected,
  selectionMode,
  isForwardedMessage,
  attachments,
  onBubblePress,
  onMentionClick,
  style,
  isMessageEdited,
  isMobileLayout,
  isGroup,
  messageTime,
  isRead = false,
  showTail = false,
}: IMessageBubbleProps) => {
  const messageContent = message.messageText;
  const hasGifMedia = hasGif(message);
  const gifUrl = getGifUrl(message);
  const { isDark } = useAppTheme();

  const { messageUrlMetadata, isMessageUrlMetadataFetching } = useMessageUrlMetadataQuery(
    message.id,
    message.isIncludeUrlMetadata
  );

  const handleMentionPress = (username: string) => {
    if (!onMentionClick || !message.mentions) return;
    const mentionedUser = message.mentions.find((user) => user.username === username);
    if (mentionedUser) {
      onMentionClick(mentionedUser);
    }
  };

  const forwardedMessage = useCallback(() => {
    const forwardedMsg = message.originalForwardedMessage;

    return (
      <View className="flex flex-row items-center gap-x-2 mb-2 p-2 bg-black/20 rounded-lg border-l-4 border-purple-400">
        <InitialsAvatar
          name={forwardedMsg?.senderFirstName || ""}
          size={AvatarSize.extraSmall}
          imageUrl={forwardedMsg?.senderSignedImageUrl}
        />

        <View>
          <AppText
            className={classNames(
              "text-xs font-bold",
              isCurrentUser ? "text-white" : "dark:text-secondary-light text-gray-800"
            )}
          >
            {forwardedMsg?.senderId && String(forwardedMsg?.senderId) === currentUserId
              ? "You"
              : `${forwardedMsg?.senderFirstName} ${forwardedMsg?.senderLastName}`}
          </AppText>
          <AppText
            className={classNames("text-[10px]", isCurrentUser ? "text-gray-200" : "text-gray-500")}
          >
            {formatDateTime(forwardedMsg?.createdAt ?? "")}
          </AppText>
        </View>
      </View>
    );
  }, [isCurrentUser, currentUserId, message.originalForwardedMessage]);

  const hasBubbleContent = hasText || hasMedia || hasGifMedia;

  return (
    <Pressable onPress={onBubblePress} disabled={!messageContent && !hasAttachments && !hasGif}>
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
            color={selected ? "#6B4EFF" : "#9CA3AF"}
          />
        </View>
      )}

      <View
        className={classNames("rounded-2xl", isCurrentUser ? "items-end" : "items-start")}
        style={style}
      >
        <MessageLabel
          isForwardedMessage={isForwardedMessage}
          isCurrentUser={isCurrentUser}
          isMessageEdited={isMessageEdited}
        />

        <View style={bubbleStyles.bubbleWrapper}>
          {showTail && <BubbleTail isCurrentUser={isCurrentUser} isDark={isDark} />}

          <View
            className={classNames(
              "rounded-2xl overflow-hidden",
              {
                "max-w-[310px]": hasMedia || hasGifMedia || hasAttachments,
                "max-w-[600px]": PLATFORM.IS_WEB && !hasMedia && !hasGifMedia && !isMobileLayout,
                "max-w-[85vw]": PLATFORM.IS_WEB && isMobileLayout && !hasMedia && !hasGifMedia,
                "max-w-[280px]": !PLATFORM.IS_WEB && !hasMedia && !hasGifMedia,
              },
              {
                "bg-primary-light dark:bg-primary-dark": hasBubbleContent && isCurrentUser,

                "bg-bubble-incoming-light dark:bg-bubble-incoming-dark":
                  hasBubbleContent && !isCurrentUser,

                "bg-transparent shadow-none": !hasBubbleContent || message.isUnsend,
              },
              {
                "border-2 border-primary-light dark:border-primary-dark": selected && selectionMode,
                "border-0": !(selected && selectionMode),
              },
              "px-3 py-2"
            )}
            style={hasBubbleContent && !message.isUnsend ? bubbleStyles.bubbleShadow : undefined}
          >
            {hasGifMedia && !message.isUnsend && (
              <View className={messageContent ? "mb-2" : ""}>
                {PLATFORM.IS_WEB ? (
                  <img
                    src={gifUrl}
                    alt="gif"
                    className="max-w-[250px] max-h-[250px] rounded-lg object-contain"
                  />
                ) : (
                  <Image
                    source={{ uri: gifUrl }}
                    style={{ width: 250, aspectRatio: 1, borderRadius: 8 }}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}

            {hasAttachments && !hasGifMedia && (
              <View className={messageContent ? "mb-2" : ""}>
                {renderFileGrid(attachments, isCurrentUser)}
              </View>
            )}

            {message.isUnsend ? (
              <UnsendMessagePreview unsendMessage={message} />
            ) : messageContent ? (
              message.isIncludeUrlMetadata && messageUrlMetadata ? (
                <LinkPreviewCard
                  messageText={message.messageText}
                  messageUrlMetadata={messageUrlMetadata}
                  isFetching={isMessageUrlMetadataFetching}
                  isCurrentUser={isCurrentUser}
                  mentions={message.mentions}
                  onMentionPress={handleMentionPress}
                  isMarkdownEnabled={message.isMarkdownEnabled}
                  isGroup={isGroup}
                />
              ) : (
                <View className="flex-col gap-y-1">
                  {message.isForwarded && forwardedMessage()}

                  <FormattedText
                    text={message.messageText}
                    mentions={message.mentions}
                    isCurrentUser={isCurrentUser}
                    onMentionPress={handleMentionPress}
                    isMarkdownEnabled={message.isMarkdownEnabled}
                    isGroup={isGroup}
                  />
                </View>
              )
            ) : null}

            {/* Inline timestamp + read receipt (WhatsApp style) */}
            {hasBubbleContent && !message.isUnsend && (
              <View className="flex-row items-center justify-end gap-1 mt-1 -mb-0.5">
                {isMessageEdited && (
                  <AppText
                    className={classNames(
                      "text-[10px]",
                      isCurrentUser ? "text-white/60" : "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    edited
                  </AppText>
                )}
                {messageTime && (
                  <AppText
                    className={classNames(
                      "text-[10px]",
                      isCurrentUser ? "text-white/60" : "text-gray-400 dark:text-gray-500"
                    )}
                  >
                    {messageTime}
                  </AppText>
                )}
                {isCurrentUser && !message.isUnsend && (
                  <Ionicons
                    name="checkmark-done"
                    size={14}
                    color={isRead ? "#22C55E" : isCurrentUser ? "rgba(255,255,255,0.5)" : "#9CA3AF"}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const bubbleStyles = StyleSheet.create({
  bubbleWrapper: {
    position: "relative",
  },
  bubbleShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  tail: {
    position: "absolute",
    top: 0,
    width: 12,
    height: 12,
    zIndex: 1,
  },
  tailLeft: {
    left: -6,
  },
  tailRight: {
    right: -6,
  },
  tailTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  tailTriangleLeft: {
    transform: [{ rotate: "-30deg" }],
  },
  tailTriangleRight: {
    transform: [{ rotate: "30deg" }],
  },
});
