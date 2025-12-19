import React from "react";
import { Pressable, View, ViewStyle, TextStyle, Image } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { IMessage, IMessageAttachment } from "@/types/chat/types";
import FormattedText from "@/components/FormattedText";
import UnsendMessagePreview from "@/components/UnsendMessagePreview";
import { ForwardedLabel } from "@/components/conversations/conversation-thread/composer/ForwardedLabel";
import { renderFileGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/renderFileGrid";
import { TUser } from "@/types/user/types";
import { PLATFORM } from "@/constants/platformConstants";

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
  onMentionClick?: (user: TUser) => void;
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
  onMentionClick,
  style,
}) => {
  const messageContent = message.messageText;
  const hasGif = !!message.gifUrl;

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
        <ForwardedLabel isForwardedMessage={isForwardedMessage} isCurrentUser={isCurrentUser} />

        <View
          className={classNames("rounded-lg border-2", {
            "bg-primary-light dark:bg-primary-dark rounded-tr-none":
              (hasText || hasImages || hasGif) && isCurrentUser,
            "bg-secondary-light dark:bg-secondary-dark rounded-tl-none":
              (hasText || hasImages || hasGif) && !isCurrentUser,
            "bg-transparent": !(hasText || hasImages || hasGif) || message.isUnsend,

            "border-sky-500 dark:border-sky-400": selected && selectionMode,
            "border-transparent": !(selected && selectionMode),

            "shadow-sm": isForwardedMessage,

            "px-3 py-2": !(hasImages && !messageContent) && !hasGif,

            "max-w-[305px]": hasAttachments,

            "border-r-2": isForwardedMessage && isCurrentUser,
            "border-l-2": isForwardedMessage && !isCurrentUser,
          })}
          style={
            isForwardedMessage
              ? isCurrentUser
                ? { borderRightColor: "#60A5FA30" }
                : { borderLeftColor: "#9CA3AF30" }
              : undefined
          }
        >
          {hasGif && !message.isUnsend && (
            <View className={messageContent ? "mb-2" : ""}>
              {PLATFORM.IS_WEB ? (
                <img
                  src={message.gifUrl}
                  alt="gif"
                  className="max-w-[250px] max-h-[250px] rounded-lg object-contain"
                />
              ) : (
                <Image
                  source={{ uri: message.gifUrl }}
                  className="w-[250px] h-[250px] rounded-lg"
                  resizeMode="contain"
                />
              )}
            </View>
          )}
          {hasAttachments && (
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
