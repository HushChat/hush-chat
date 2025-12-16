import { Gesture, GestureDetector } from "react-native-gesture-handler";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GestureResponderEvent, View, StyleSheet } from "react-native";
import { format } from "date-fns";
import {
  ConversationAPIResponse,
  IMessage,
  IOption,
  ReactionType,
  MessageTypeEnum,
} from "@/types/chat/types";
import { PLATFORM } from "@/constants/platformConstants";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import ParentMessagePreview from "./ParentMessagePreview";
import WebContextMenu from "@/components/WebContextMenu";
import { SwipeableMessageRow } from "@/gestures/components/SwipeableMessageRow";
import { useAddMessageReactionMutation } from "@/query/post/queries";
import { useRemoveMessageReactionMutation } from "@/query/delete/queries";
import { ToastUtils } from "@/utils/toastUtils";
import { useUserStore } from "@/store/user/useUserStore";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useQueryClient } from "@tanstack/react-query";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";
import { logInfo } from "@/utils/logger";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { MessageHeader } from "@/components/conversations/conversation-thread/message-list/MessageHeader";
import { MessageBubble } from "@/components/conversations/conversation-thread/message-list/MessageBubble";
import { MessageReactions } from "@/components/conversations/conversation-thread/message-list/MessageReactions";
import { isImageAttachment } from "@/utils/messageHelpers";
import { AppText } from "@/components/AppText";

const COLORS = {
  TRANSPARENT: "transparent",
  ICON_MUTED: "#9CA3AF",
  ICON_PRIMARY: "#3B82F6",
  FORWARDED_INCOMING_BORDER: "#9CA3AF30",
  FORWARDED_OUTGOING_BORDER: "#60A5FA30",
};

interface MessageItemProps {
  message: IMessage;
  isCurrentUser: boolean;
  currentUserId: string;
  isPickerOpen: boolean;
  onOpenPicker: (messageId: string) => void;
  conversationAPIResponse?: ConversationAPIResponse;
  onMessageSelect?: (message: IMessage) => void;
  selected: boolean;
  onStartSelectionWith: (messageId: number) => void;
  onToggleSelection: (messageId: number) => void;
  onMessageLongPress?: (message: IMessage) => void;
  onCloseAllOverlays?: () => void;
  onMessagePin: (message: IMessage) => void;
  onUnsendMessage: (message: IMessage) => void;
  selectedConversationId: number;
  onViewReactions: (messageId: number, position: { x: number; y: number }, isOpen: boolean) => void;
  showSenderAvatar: boolean;
  showSenderName: boolean;
  onNavigateToMessage?: (messageId: number) => void;
  isImageGroup?: boolean;
  groupedMessages?: IMessage[];
}

const REMOVE_ONE = 1;
const ADD_ONE = 1;
const MIN_COUNT = 0;

export const ConversationMessageItem = ({
  message,
  isCurrentUser,
  currentUserId,
  isPickerOpen,
  onOpenPicker,
  conversationAPIResponse,
  onMessageSelect,
  selected,
  onStartSelectionWith,
  onToggleSelection,
  onMessageLongPress,
  onCloseAllOverlays,
  onMessagePin,
  selectedConversationId,
  onUnsendMessage,
  onViewReactions,
  showSenderAvatar,
  showSenderName,
  onNavigateToMessage,
  isImageGroup = false,
  groupedMessages,
}: MessageItemProps) => {
  const attachments = message.messageAttachments ?? [];
  const hasAttachments = attachments.length > 0 || isImageGroup;

  const queryClient = useQueryClient();

  const hasImages = () => attachments.some(isImageAttachment) || isImageGroup;

  const [webMenuVisible, setWebMenuVisible] = useState<boolean>(false);
  const [webMenuPos, setWebMenuPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const pinnedMessageId = conversationAPIResponse?.pinnedMessage?.id;
  const isThisMessagePinned = pinnedMessageId === message.id;
  const parentMessage = message.parentMessage;
  const [reactionSummary, setReactionSummary] = useState(
    message.reactionSummary || { counts: {}, currentUserReaction: "" }
  );
  const reactedByCurrentUser = reactionSummary?.currentUserReaction || "";
  const {
    user: { id: userId },
  } = useUserStore();
  const { selectionMode } = useConversationStore();

  const messageContent = message.messageText;
  const isForwardedMessage = message.isForwarded;
  const hasText = !!messageContent;
  const isGroupChat = conversationAPIResponse?.isGroup;
  const isSystemEvent = message.messageType === MessageTypeEnum.SYSTEM_EVENT;

  const displayMessage =
    isImageGroup && groupedMessages?.length ? groupedMessages[groupedMessages.length - 1] : message;

  const messageTime = useMemo(
    () => format(new Date(displayMessage.createdAt), "h:mm a"),
    [displayMessage.createdAt]
  );

  useEffect(() => {
    if (message.reactionSummary) setReactionSummary(message.reactionSummary);
  }, [message.reactionSummary]);

  const hasReactions = useMemo(
    () => Object.values(reactionSummary?.counts || {}).some((count) => (count || 0) > 0),
    [reactionSummary]
  );

  const senderName = useMemo(
    () =>
      `${message.senderFirstName || ""} ${message.senderLastName || ""}`.trim() || "Unknown User",
    [message.senderFirstName, message.senderLastName]
  );

  const outerGesture = useMemo(() => {
    if (PLATFORM.IS_WEB && !message.isUnsend && !isSystemEvent) {
      return Gesture.Tap()
        .numberOfTaps(2)
        .runOnJS(true)
        .onStart(() => {
          onMessageSelect?.(message);
          if (conversationAPIResponse?.isBlocked) return;
        });
    }
    return Gesture.Tap().enabled(false);
  }, [conversationAPIResponse?.isBlocked, onMessageSelect, message, isSystemEvent]);

  const openWebMenuAtEvent = useCallback(
    (event: GestureResponderEvent) => {
      if (!PLATFORM.IS_WEB) return;
      if (selectionMode) return;
      if (isSystemEvent) return;
      const { pageX, pageY } = event.nativeEvent;
      setWebMenuPos({ x: pageX ?? 0, y: pageY ?? 0 });
      setWebMenuVisible(true);
    },
    [selectionMode, isSystemEvent]
  );

  const handleWebMenuClose = useCallback(() => setWebMenuVisible(false), []);

  const webOptions: IOption[] = useMemo(() => {
    if (message.isUnsend || isSystemEvent) {
      return [];
    }

    const options: IOption[] = [
      {
        id: 1,
        name: "Reply",
        iconName: "arrow-undo-outline",
        action: () => onMessageSelect?.(message),
      },
      {
        id: 2,
        name: isThisMessagePinned ? "Unpin Message" : "Pin Message",
        iconName: (isThisMessagePinned ? "pin" : "pin-outline") as keyof typeof Ionicons.glyphMap,
        action: () => onMessagePin(message),
      },
      {
        id: 3,
        name: "Select message",
        iconName: "checkmark-circle-outline",
        action: () => onStartSelectionWith(Number(message.id)),
      },
    ];
    if (isCurrentUser && !message.isUnsend) {
      options.push({
        id: 4,
        name: "Unsend Message",
        iconName: "ban" as keyof typeof Ionicons.glyphMap,
        action: () => onUnsendMessage(message),
      });
    }
    return options;
  }, [
    message,
    isThisMessagePinned,
    isCurrentUser,
    onMessagePin,
    onStartSelectionWith,
    onUnsendMessage,
    isSystemEvent,
  ]);

  const handleLongPress = useCallback(() => {
    if (conversationAPIResponse?.isBlocked) return;
    if (selectionMode) return;
    if (isSystemEvent) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenPicker(String(message.id));
    onMessageLongPress?.(message);
  }, [
    conversationAPIResponse?.isBlocked,
    selectionMode,
    message,
    onMessageLongPress,
    onOpenPicker,
    isSystemEvent,
  ]);

  const handleOpenPicker = useCallback(() => {
    if (conversationAPIResponse?.isBlocked || !conversationAPIResponse?.isActive) return;
    if (selectionMode) return;
    if (isSystemEvent) return;
    onOpenPicker(String(message.id));
  }, [
    conversationAPIResponse?.isBlocked,
    conversationAPIResponse?.isActive,
    selectionMode,
    onOpenPicker,
    message.id,
    isSystemEvent,
  ]);

  const addReaction = useAddMessageReactionMutation(
    { userId: Number(userId), conversationId: selectedConversationId },
    () => {
      if (message.id) {
        queryClient.invalidateQueries({
          queryKey: conversationMessageQueryKeys.messageReactions(message.id),
        });
      }
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const removeReaction = useRemoveMessageReactionMutation(
    { userId: Number(userId), conversationId: selectedConversationId },
    () => {
      if (message.id) {
        queryClient.invalidateQueries({
          queryKey: conversationMessageQueryKeys.messageReactions(message.id),
        });
      }
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const handleViewReactions = useCallback(
    (position: { x: number; y: number }, isOpen: boolean) =>
      onViewReactions(message.id, position, isOpen),
    [message.id, onViewReactions]
  );

  const handleSelectReaction = useCallback(
    async (newReaction: ReactionType) => {
      if (conversationAPIResponse?.isBlocked) return;
      if (selectionMode) return;

      const previousReaction = reactionSummary?.currentUserReaction || "";
      const reactionCounts = { ...(reactionSummary?.counts ?? {}) };
      onCloseAllOverlays?.();

      if (previousReaction === newReaction) {
        removeReaction.mutate(message.id, {
          onSuccess: () => {
            reactionCounts[newReaction] = Math.max(
              MIN_COUNT,
              (reactionCounts[newReaction] ?? 0) - REMOVE_ONE
            );
            setReactionSummary({
              counts: reactionCounts,
              currentUserReaction: "",
            });
          },
        });
        return;
      }

      addReaction.mutate(
        { messageId: message.id, reaction: { reactionType: newReaction } },
        {
          onSuccess: () => {
            if (previousReaction) {
              reactionCounts[previousReaction] = Math.max(
                MIN_COUNT,
                (reactionCounts[previousReaction] ?? 0) - REMOVE_ONE
              );
            }
            reactionCounts[newReaction] = (reactionCounts[newReaction] ?? 0) + ADD_ONE;
            setReactionSummary({
              counts: reactionCounts,
              currentUserReaction: newReaction,
            });
          },
        }
      );
    },
    [
      conversationAPIResponse?.isBlocked,
      onCloseAllOverlays,
      reactionSummary?.currentUserReaction,
      reactionSummary?.counts,
      message.id,
      selectionMode,
      removeReaction,
      addReaction,
    ]
  );

  const renderParentMessage = () => {
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

  const handleBubblePress = useCallback(() => {
    if (!selectionMode) return;
    if (isSystemEvent) return;
    onToggleSelection(Number(message.id));
  }, [selectionMode, onToggleSelection, message.id, isSystemEvent]);

  if (isSystemEvent) {
    return (
      <View className="flex-row justify-center items-center py-2 px-4">
        <View className="dark:bg-secondary-dark bg-secondary-light rounded-lg py-1.5 px-3 max-w-[80%]">
          <AppText className="dark:!text-gray-300 text-gray-700 text-xs text-center">
            {messageContent}
          </AppText>
        </View>
      </View>
    );
  }

  const ContentBlock = () => (
    <View style={styles.contentBlockWrapper}>
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
          ) : isGroupChat ? (
            <View className="mr-2 pt-1 w-10 h-10" />
          ) : null}
          <View className="flex-1">
            <MessageHeader
              isCurrentUser={isCurrentUser}
              isGroupChat={isGroupChat}
              showSenderName={showSenderName}
              senderName={senderName}
              messageTime={messageTime}
              messageIsUnsend={message.isUnsend}
              selectionMode={selectionMode}
              currentUserId={currentUserId}
              onOpenPicker={handleOpenPicker}
              onOpenMenu={openWebMenuAtEvent}
              messageText={message.messageText}
              isRead={displayMessage.isReadByEveryone}
            />

            {renderParentMessage()}

            <MessageBubble
              message={message}
              isCurrentUser={isCurrentUser}
              hasText={hasText}
              hasAttachments={hasAttachments}
              hasImages={hasImages()}
              selected={selected}
              selectionMode={selectionMode}
              isForwardedMessage={isForwardedMessage}
              attachments={attachments}
              onBubblePress={handleBubblePress}
              isImageGroup={isImageGroup}
              groupedMessages={groupedMessages}
            />

            <MessageReactions
              message={message}
              isCurrentUser={isCurrentUser}
              isPickerOpen={isPickerOpen}
              conversationIsBlocked={conversationAPIResponse?.isBlocked ?? false}
              selectionMode={selectionMode}
              reactedByCurrentUser={reactedByCurrentUser}
              reactionSummary={reactionSummary}
              hasReactions={hasReactions}
              onSelectReaction={handleSelectReaction}
              onCloseAllOverlays={onCloseAllOverlays}
              onViewReactions={handleViewReactions}
            />
          </View>
        </View>
      </View>

      {PLATFORM.IS_WEB && (
        <WebContextMenu
          visible={webMenuVisible && !selectionMode}
          position={webMenuPos}
          onClose={handleWebMenuClose}
          options={webOptions}
          iconSize={18}
          onOptionSelect={async (action: () => Promise<void> | void) => {
            try {
              await action();
            } catch (error) {
              logInfo("Error executing context menu action:", error);
            }
          }}
        />
      )}
    </View>
  );

  if (PLATFORM.IS_WEB) {
    return (
      <div
        onDoubleClick={() => {
          if (message.isUnsend) return;
          if (conversationAPIResponse?.isBlocked) return;
          onMessageSelect?.(message);
        }}
        style={webStyles.contents}
      >
        <ContentBlock />
      </div>
    );
  }

  return (
    <GestureDetector gesture={outerGesture}>
      <SwipeableMessageRow
        onReply={() => {
          if (conversationAPIResponse?.isBlocked) return;
          onMessageSelect?.(message);
        }}
        onLongPress={handleLongPress}
        trigger={42}
        maxDrag={80}
        showAffordance
        enabled={!selectionMode}
      >
        <ContentBlock />
      </SwipeableMessageRow>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  contentBlockWrapper: {
    backgroundColor: COLORS.TRANSPARENT,
  },
});

const webStyles = {
  contents: {
    display: "contents",
  },
};
