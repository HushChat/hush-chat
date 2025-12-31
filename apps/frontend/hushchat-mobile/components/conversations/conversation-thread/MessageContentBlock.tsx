import { GestureResponderEvent, View } from "react-native";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { MessageHeader } from "@/components/conversations/conversation-thread/message-list/MessageHeader";
import { MessageBubble } from "@/components/conversations/conversation-thread/message-list/MessageBubble";
import React, { useMemo } from "react";
import { IMessage } from "@/types/chat/types";
import { format } from "date-fns";
import ParentMessagePreview from "@/components/conversations/conversation-thread/message-list/ParentMessagePreview";
import { isImageAttachment, isVideoAttachment } from "@/utils/messageHelpers";
import { MessageHighlightWrapper } from "@/components/MessageHighlightWrapper";
import { TUser } from "@/types/user/types";

interface IMessageContentBlock {
  message: IMessage;
  isCurrentUser: boolean;
  currentUserId: string;
  isGroup?: boolean;
  showSenderAvatar: boolean;
  selected: boolean;
  selectionMode: boolean;
  handleOpenPicker?: () => void;
  onNavigateToMessage?: (messageId: number) => void;
  openWebMenuAtEvent?: (event: GestureResponderEvent) => void;
  onBubblePress?: () => void;
  children?: React.ReactNode;
  isFavoriteView?: boolean;
  showSenderName: boolean;
  targetMessageId?: number | null;
  isForwardedMessage: boolean;
  onMentionClick?: (user: TUser) => void;
}

export default function MessageContentBlock({
  message,
  isCurrentUser,
  currentUserId,
  isGroup,
  showSenderAvatar = false,
  selected = false,
  selectionMode = false,
  handleOpenPicker = () => {},
  onNavigateToMessage = () => {},
  openWebMenuAtEvent = () => {},
  onBubblePress = () => {},
  children,
  isFavoriteView = false,
  showSenderName,
  targetMessageId,
  isForwardedMessage,
  onMentionClick,
}: IMessageContentBlock) {
  const senderName = useMemo(
    () =>
      `${message.senderFirstName || ""} ${message.senderLastName || ""}`.trim() || "Unknown User",
    [message.senderFirstName, message.senderLastName]
  );

  const messageTime = useMemo(
    () => format(new Date(message.createdAt), "h:mm a"),
    [message.createdAt]
  );

  const messageContent = message.messageText;
  const hasText = !!messageContent;
  const attachments = message.messageAttachments ?? [];
  const hasAttachments = attachments.length > 0;

  const hasMedia = useMemo(
    () => attachments.some((a) => isImageAttachment(a) || isVideoAttachment(a)),
    [attachments]
  );

  const renderParentMessage = () => {
    const parentMessage = message.parentMessage;
    if (!parentMessage || message.isUnsend) return null;

    return (
      <View className="mb-1">
        <ParentMessagePreview
          message={message}
          parentMessage={parentMessage}
          currentUserId={currentUserId}
          onNavigateToMessage={onNavigateToMessage}
          isFavoriteView={isFavoriteView}
        />
      </View>
    );
  };

  return (
    <View className="group mb-3">
      <View className="flex-row mx-2">
        {showSenderAvatar ? (
          <View className="mr-2 pt-1 w-10 h-10">
            <InitialsAvatar
              name={senderName}
              size={AvatarSize.extraSmall}
              imageUrl={message.senderSignedImageUrl}
            />
          </View>
        ) : isGroup ? (
          <View className="mr-2 pt-1 w-10 h-10" />
        ) : null}
        <View className="flex-1">
          <MessageHeader
            isCurrentUser={isCurrentUser}
            isGroupChat={isGroup}
            showSenderName={showSenderName}
            senderName={senderName}
            messageTime={messageTime}
            messageIsUnsend={message.isUnsend}
            selectionMode={selectionMode}
            currentUserId={currentUserId}
            onOpenPicker={handleOpenPicker}
            onOpenMenu={openWebMenuAtEvent}
            messageText={message.messageText}
            isRead={message.isReadByEveryone}
            isFavoriteView={isFavoriteView}
          />

          {renderParentMessage()}

          <View className={isCurrentUser ? "self-end" : "self-start"}>
            <MessageHighlightWrapper
              isHighlighted={message.id === targetMessageId}
              glowColor="#3B82F6"
            >
              <MessageBubble
                message={message}
                isCurrentUser={isCurrentUser}
                hasText={hasText}
                hasAttachments={hasAttachments}
                hasMedia={hasMedia}
                selected={selected}
                selectionMode={selectionMode}
                isForwardedMessage={isForwardedMessage}
                attachments={attachments}
                onBubblePress={onBubblePress}
                onMentionClick={onMentionClick}
              />
            </MessageHighlightWrapper>
          </View>

          {children ?? null}
        </View>
      </View>
    </View>
  );
}
