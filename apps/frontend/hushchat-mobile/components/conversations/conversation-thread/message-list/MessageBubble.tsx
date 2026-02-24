import React, { useCallback } from "react";
import { Pressable, View, ViewStyle, TextStyle, Image, ActivityIndicator } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { IMessage, IMessageAttachment } from "@/types/chat/types";
import FormattedText from "@/components/FormattedText";
import UnsendMessagePreview from "@/components/UnsendMessagePreview";
import { MessageLabel } from "@/components/conversations/conversation-thread/composer/MessageLabel";
import { renderFileGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/renderFileGrid";
import { TUser } from "@/types/user/types";
import { useOGMetadataStore } from "@/store/ogMetadata/useOGMetadataStore";
import { PLATFORM } from "@/constants/platformConstants";
import LinkPreviewCard from "@/components/conversations/LinkPreviewCard";
import { getGifUrl, hasGif } from "@/utils/messageUtils";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import { formatDateTime } from "@/utils/commonUtils";
import { selectIsMessageUploading } from "@/store/attachmentUpload/useAttachmentUploadSlice";
import { useAttachmentUploadStore } from "@/store/attachmentUpload/useAttachmentUploadStore";

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
  uploadProgress?: number;
}

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
  uploadProgress,
}: IMessageBubbleProps) => {
  const messageContent = message.messageText;
  const hasGifMedia = hasGif(message);
  const gifUrl = getGifUrl(message);

  const messageUrlMetadata = useOGMetadataStore((state) => state.metadata[message.id]);
  const isMessageUrlMetadataFetching = useOGMetadataStore((state) =>
    state.pendingMessageIds.has(message.id)
  );

  const isUploading = useAttachmentUploadStore(selectIsMessageUploading(message.id));

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
        className={classNames("rounded-2xl", isCurrentUser ? "items-end" : "items-start")}
        style={style}
      >
        <MessageLabel
          isForwardedMessage={isForwardedMessage}
          isCurrentUser={isCurrentUser}
          isMessageEdited={isMessageEdited}
        />

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
              "bg-primary-light dark:bg-primary-dark rounded-tr-sm":
                (hasText || hasMedia || hasGifMedia) && isCurrentUser,

              "bg-secondary-light dark:bg-secondary-dark rounded-tl-sm":
                (hasText || hasMedia || hasGifMedia) && !isCurrentUser,

              "bg-transparent shadow-none":
                !(hasText || hasMedia || hasGifMedia) || message.isUnsend,
            },
            {
              "border-2 border-sky-500": selected && selectionMode,
              "border-0": !(selected && selectionMode),
            },
            "px-3 py-2"
          )}
        >
          {isUploading && !isMobileLayout && (
            <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
              <View className="bg-black/60 rounded-full p-2 items-center justify-center w-12 h-12">
                <ActivityIndicator size="small" color="#ffffff" />
                {uploadProgress && (
                  <AppText className="text-[10px] text-white font-bold mt-1">
                    {uploadProgress}%
                  </AppText>
                )}
              </View>
            </View>
          )}

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
              {renderFileGrid(attachments, isCurrentUser, message.isStored, isUploading)}
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
        </View>
      </View>
    </Pressable>
  );
};
