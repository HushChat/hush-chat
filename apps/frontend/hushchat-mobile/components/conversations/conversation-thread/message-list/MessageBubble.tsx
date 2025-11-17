import React from "react";
import { Pressable, View } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { IMessage, IMessageAttachment } from "@/types/chat/types";
import FormattedText from "@/components/FormattedText";
import UnsendMessagePreview from "@/components/UnsendMessagePreview";
import { ForwardedLabel } from "@/components/conversations/conversation-thread/composer/ForwardedLabel";
import { renderFileGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/renderFileGrid";

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
}) => {
  const messageContent = message.messageText;

  const getBubbleBorderStyle = () => {
    if (!isForwardedMessage) return {};

    return isCurrentUser
      ? { borderRightWidth: 2, borderRightColor: "#60A5FA30" }
      : { borderLeftWidth: 2, borderLeftColor: "#9CA3AF30" };
  };

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

      <View className={classNames("rounded-xl", isCurrentUser ? "items-end" : "items-start")}>
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

            "px-3 py-2": !(hasImages && !messageContent),
          })}
          style={{
            maxWidth: hasAttachments ? 305 : "70%",
            ...getBubbleBorderStyle(),
          }}
        >
          {hasAttachments && (
            <View className={messageContent ? "mb-2" : ""}>
              {renderFileGrid(attachments, isCurrentUser)}
            </View>
          )}

          {!message.isUnsend && messageContent ? (
            <FormattedText
              text={message.messageText}
              style={{
                fontSize: 16,
                lineHeight: 20,
                fontFamily: "Poppins-Regular",
              }}
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
