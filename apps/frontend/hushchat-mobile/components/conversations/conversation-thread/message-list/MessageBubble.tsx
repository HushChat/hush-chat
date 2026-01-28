import React from "react";
import { Pressable, View, ViewStyle, TextStyle, Image } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { IMessage, IMessageAttachment } from "@/types/chat/types";
import FormattedText from "@/components/FormattedText";
import UnsendMessagePreview from "@/components/UnsendMessagePreview";
import { MessageLabel } from "@/components/conversations/conversation-thread/composer/MessageLabel";
import { renderFileGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/renderFileGrid";
import { TUser } from "@/types/user/types";
import { PLATFORM } from "@/constants/platformConstants";
import { getGifUrl, hasGif } from "@/utils/messageUtils";

interface IMessageBubbleProps {
  message: IMessage;
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
}

export const MessageBubble = ({
  message,
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
}: IMessageBubbleProps) => {
  const messageContent = message.messageText;
  const hasGifMedia = hasGif(message);
  const gifUrl = getGifUrl(message);

  const handleMentionPress = (username: string) => {
    if (!onMentionClick || !message.mentions) return;

    const mentionedUser = message.mentions.find((user) => user.username === username);

    if (mentionedUser) {
      onMentionClick(mentionedUser);
    }
  };

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
            color={selected ? "#3B82F6" : "#9CA3AF"}
          />
        </View>
      )}

      <View
        className={classNames("rounded-xl", isCurrentUser ? "items-end" : "items-start")}
        style={style}
      >
        <MessageLabel
          isForwardedMessage={isForwardedMessage}
          isCurrentUser={isCurrentUser}
          isMessageEdited={isMessageEdited}
        />

        <View
          className={classNames(
            "rounded-lg border-2",
            {
              "max-w-[310px]": hasMedia || hasGifMedia || hasAttachments,
              "max-w-[600px]": PLATFORM.IS_WEB && !hasMedia && !hasGifMedia && !isMobileLayout,
              "max-w-[85vw]": PLATFORM.IS_WEB && isMobileLayout && !hasMedia && !hasGifMedia,
              "max-w-[280px]": !PLATFORM.IS_WEB && !hasMedia && !hasGifMedia,
            },
            {
              "bg-primary-light dark:bg-primary-dark rounded-tr-none":
                (hasText || hasMedia || hasGifMedia) && isCurrentUser,
              "bg-secondary-light dark:bg-secondary-dark rounded-tl-none":
                (hasText || hasMedia || hasGifMedia) && !isCurrentUser,
              "bg-transparent": !(hasText || hasMedia || hasGifMedia) || message.isUnsend,

              "border-sky-500 dark:border-sky-400": selected && selectionMode,
              "border-transparent": !(selected && selectionMode),

              "shadow-sm": isForwardedMessage,

              "px-3 py-2": !(hasMedia && !messageContent) && !hasGifMedia,
            }
          )}
          style={{
            ...(isForwardedMessage
              ? isCurrentUser
                ? { borderRightColor: "#60A5FA30" }
                : { borderLeftColor: "#9CA3AF30" }
              : {}),
          }}
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

          {!message.isUnsend && messageContent ? (
            <FormattedText
              text={message.messageText}
              mentions={message.mentions}
              isCurrentUser={isCurrentUser}
              onMentionPress={handleMentionPress}
            />
          ) : message.isUnsend ? (
            <UnsendMessagePreview unsendMessage={message} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};
