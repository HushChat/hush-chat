/**
 * ConversationMessageItem
 * Renders a single message bubble within a conversation thread.
 */

import { Gesture, GestureDetector } from "react-native-gesture-handler";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GestureResponderEvent, View, StyleSheet } from "react-native";
import { format } from "date-fns";
import { ConversationAPIResponse, IMessage, IOption, ReactionType } from "@/types/chat/types";
import classNames from "classnames";
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

const COLORS = {
  TRANSPARENT: "transparent",
  ICON_MUTED: "#9CA3AF",
  ICON_PRIMARY: "#3B82F6",
  FORWARDED_INCOMING_BORDER: "#9CA3AF30",
  FORWARDED_OUTGOING_BORDER: "#60A5FA30",
};
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { MessageHeader } from "@/components/conversations/conversation-thread/message-list/MessageHeader";
import { MessageBubble } from "@/components/conversations/conversation-thread/message-list/MessageBubble";
import { MessageReactions } from "@/components/conversations/conversation-thread/message-list/MessageReactions";
import { isImageAttachment } from "@/utils/messageHelpers";

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
}: MessageItemProps) => {
  const attachments = message.messageAttachments ?? [];
  const hasAttachments = attachments.length > 0;

  const queryClient = useQueryClient();

  const hasImages = () => attachments.some(isImageAttachment);

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
  const showAvatar = isGroupChat && !isCurrentUser;

  const messageTime = useMemo(
    () => format(new Date(message.createdAt), "h:mm a"),
    [message.createdAt]
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
    if (PLATFORM.IS_WEB && !message.isUnsend) {
      return Gesture.Tap()
        .numberOfTaps(2)
        .runOnJS(true)
        .onStart(() => {
          onMessageSelect?.(message);
          if (conversationAPIResponse?.isBlocked) return;
        });
    }
    return Gesture.Tap().enabled(false);
  }, [conversationAPIResponse?.isBlocked, onMessageSelect, message]);

  const openWebMenuAtEvent = useCallback(
    (event: GestureResponderEvent) => {
      if (!PLATFORM.IS_WEB) return;
      if (selectionMode) return;
      const { pageX, pageY } = event.nativeEvent;
      setWebMenuPos({ x: pageX ?? 0, y: pageY ?? 0 });
      setWebMenuVisible(true);
    },
    [selectionMode]
  );

  const handleWebMenuClose = useCallback(() => setWebMenuVisible(false), []);

  const webOptions: IOption[] = useMemo(() => {
    if (message.isUnsend) {
      return [];
    }

    const options: IOption[] = [
      {
        id: 1,
        name: isThisMessagePinned ? "Unpin Message" : "Pin Message",
        iconName: (isThisMessagePinned ? "pin" : "pin-outline") as keyof typeof Ionicons.glyphMap,
        action: () => onMessagePin(message),
      },
      {
        id: 2,
        name: "Select message",
        iconName: "checkmark-circle-outline",
        action: () => onStartSelectionWith(Number(message.id)),
      },
    ];
    if (isCurrentUser && !message.isUnsend) {
      options.push({
        id: 3,
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
  ]);

  const handleLongPress = useCallback(() => {
    if (conversationAPIResponse?.isBlocked) return;
    if (selectionMode) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenPicker(String(message.id));
    onMessageLongPress?.(message);
  }, [
    conversationAPIResponse?.isBlocked,
    selectionMode,
    message,
    onMessageLongPress,
    onOpenPicker,
  ]);

  const handleOpenPicker = useCallback(() => {
    if (conversationAPIResponse?.isBlocked || !conversationAPIResponse?.isActive) return;
    if (selectionMode) return;
    onOpenPicker(String(message.id));
  }, [
    conversationAPIResponse?.isBlocked,
    conversationAPIResponse?.isActive,
    selectionMode,
    onOpenPicker,
    message.id,
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
        />
      </View>
    );
  };

  const handleBubblePress = useCallback(() => {
    if (!selectionMode) return;
    onToggleSelection(Number(message.id));
  }, [selectionMode, onToggleSelection, message.id]);

  const bubbleStyles = useMemo(
    () => [
      hasAttachments ? styles.bubbleWithAttachments : styles.bubbleWithoutAttachments,
      isForwardedMessage && !isCurrentUser && styles.forwardedIncomingBorder,
      isForwardedMessage && isCurrentUser && styles.forwardedOutgoingBorder,
    ],
    [hasAttachments, isForwardedMessage, isCurrentUser]
  );

  const ContentBlock = () => (
    <View style={styles.contentBlockWrapper}>
      <View className="group mb-3">
        <View className={classNames("flex-row", showAvatar ? "mx-2" : "mx-4")}>
          {showAvatar && (
            <View className="mr-2 pt-1">
              <InitialsAvatar
                name={senderName}
                size={AvatarSize.small}
                imageUrl={message.senderSignedImageUrl}
              />
            </View>
          )}

          <View className="flex-1">
            <MessageHeader
              isCurrentUser={isCurrentUser}
              isGroupChat={isGroupChat}
              senderName={senderName}
              messageTime={messageTime}
              messageIsUnsend={message.isUnsend}
              selectionMode={selectionMode}
              currentUserId={currentUserId}
              onOpenPicker={handleOpenPicker}
              onOpenMenu={openWebMenuAtEvent}
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
  iconButton: {
    minWidth: 24,
    minHeight: 24,
    cursor: "pointer",
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  selectionIcon: {
    position: "absolute",
    top: -6,
    zIndex: 10,
  },
  selectionIconRight: {
    right: -6,
  },
  selectionIconLeft: {
    left: -6,
  },
  bubbleWithAttachments: {
    maxWidth: 305,
  },
  bubbleWithoutAttachments: {
    maxWidth: "70%",
  },
  forwardedIncomingBorder: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.FORWARDED_INCOMING_BORDER,
  },
  forwardedOutgoingBorder: {
    borderRightWidth: 2,
    borderRightColor: COLORS.FORWARDED_OUTGOING_BORDER,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },
});

const webStyles = {
  contents: {
    display: "contents",
  },
};
