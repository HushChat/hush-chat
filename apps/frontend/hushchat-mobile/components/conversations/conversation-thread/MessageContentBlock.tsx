import { GestureResponderEvent, View } from "react-native";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { MessageHeader } from "@/components/conversations/conversation-thread/message-list/MessageHeader";
import { MessageBubble } from "@/components/conversations/conversation-thread/message-list/MessageBubble";
import React, { useMemo } from "react";
import { IMessage } from "@/types/chat/types";
import { format } from "date-fns";
import ParentMessagePreview from "@/components/conversations/conversation-thread/message-list/ParentMessagePreview";
import { isImageAttachment } from "@/utils/messageHelpers";

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
  showHeader: boolean;
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
  showHeader = true,
  children,
}: IMessageContentBlock) {
  const hasImages = () => attachments.some(isImageAttachment);

  const senderName = `${message.senderFirstName} ${message.senderLastName}`;

  const messageTime = useMemo(
    () => format(new Date(message.createdAt), "h:mm a"),
    [message.createdAt]
  );

  const messageContent = message.messageText;
  const hasText = !!messageContent;
  const attachments = message.messageAttachments ?? [];
  const hasAttachments = attachments.length > 0;

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
        />
      </View>
    );
  };

  return (
    <View className="group mb-3">
      <View className="flex-row mx-2">
        {showSenderAvatar && (
          <View className="mr-2 pt-1 w-10 h-10">
            <InitialsAvatar
              name={senderName}
              size={AvatarSize.extraSmall}
              imageUrl={message.senderSignedImageUrl}
            />
          </View>
        )}
        <View className="flex-1">
          {showHeader && (
            <MessageHeader
              isCurrentUser={isCurrentUser}
              isGroupChat={isGroup}
              senderName={senderName}
              messageTime={messageTime}
              messageIsUnsend={message.isUnsend}
              selectionMode={selectionMode}
              currentUserId={currentUserId}
              onOpenPicker={handleOpenPicker}
              onOpenMenu={openWebMenuAtEvent}
              messageText={message.messageText}
              isRead={message.isReadByEveryone}
            />
          )}

          {renderParentMessage()}

          <MessageBubble
            message={message}
            isCurrentUser={isCurrentUser}
            hasText={hasText}
            hasAttachments={hasAttachments}
            hasImages={hasImages()}
            selected={selected}
            selectionMode={selectionMode}
            isForwardedMessage={message.isForwarded}
            attachments={attachments}
            onBubblePress={onBubblePress}
          />

          {children ?? null}
        </View>
      </View>
    </View>
  );
}
