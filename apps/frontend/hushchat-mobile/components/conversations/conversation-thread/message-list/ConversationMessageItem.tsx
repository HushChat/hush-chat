/**
 * ConversationMessageItem
 * Renders a single message bubble within a conversation thread.
 */

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
  PIN_MESSAGE_OPTIONS,
  IMessageAttachment,
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
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";
import { logInfo } from "@/utils/logger";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { MessageHeader } from "@/components/conversations/conversation-thread/message-list/MessageHeader";
import { MessageBubble } from "@/components/conversations/conversation-thread/message-list/MessageBubble";
import { MessageReactions } from "@/components/conversations/conversation-thread/message-list/MessageReactions";
import { isImageAttachment, isVideoAttachment } from "@/utils/messageHelpers";
import { TUser } from "@/types/user/types";
import { MentionProfileModal } from "@/components/conversations/conversation-thread/message-list/MentionProfileModel";
import { router } from "expo-router";
import { createOneToOneConversation } from "@/apis/conversation";
import { AppText } from "@/components/AppText";
import { MessageHighlightWrapper } from "@/components/MessageHighlightWrapper";
import { CONVERSATION } from "@/constants/routes";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import { useModalContext } from "@/context/modal-context";

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
  onMessageLongPress?: (message: IMessage, attachment?: IMessageAttachment) => void;
  onCloseAllOverlays?: () => void;
  onMessagePin: (message: IMessage, duration: string | null) => void;
  onUnsendMessage: (message: IMessage) => void;
  selectedConversationId: number;
  onViewReactions: (messageId: number, position: { x: number; y: number }, isOpen: boolean) => void;
  showSenderAvatar: boolean;
  showSenderName: boolean;
  onNavigateToMessage?: (messageId: number) => void;
  targetMessageId?: number | null;
  webMessageInfoPress?: (messageId: number) => void;
  onMarkMessageAsUnread: (message: IMessage) => void;
  onEditMessage?: (message: IMessage) => void;
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
  onUnsendMessage,
  onViewReactions,
  showSenderAvatar,
  showSenderName,
  onNavigateToMessage,
  targetMessageId,
  webMessageInfoPress,
  onMarkMessageAsUnread,
  onEditMessage,
}: MessageItemProps) => {
  const attachments = message.messageAttachments ?? [];
  const hasAttachments = attachments.length > 0;

  const queryClient = useQueryClient();

  const hasMedia = useMemo(
    () => attachments.some((a) => isImageAttachment(a) || isVideoAttachment(a)),
    [attachments]
  );
  const { openModal, closeModal } = useModalContext();

  const [webMenuVisible, setWebMenuVisible] = useState<boolean>(false);
  const [webMenuPos, setWebMenuPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [showProfilePreviewModal, setShowProfilePreviewModal] = useState(false);
  const [selectedPreviewUser, setSelectedPreviewUser] = useState<TUser | null>(null);
  const pinnedMessageId = conversationAPIResponse?.pinnedMessage?.id;
  const isThisMessagePinned = pinnedMessageId === message.id;
  const parentMessage = message.parentMessage;
  const [reactionSummary, setReactionSummary] = useState(
    message.reactionSummary || { counts: {}, currentUserReaction: "" }
  );
  const reactedByCurrentUser = reactionSummary?.currentUserReaction || "";
  const { selectionMode } = useConversationStore();

  const messageContent = message.messageText;
  const isForwardedMessage = message.isForwarded;
  const isMessageEdited = message.isEdited;
  const hasText = !!messageContent;
  const isGroupChat = conversationAPIResponse?.isGroup;
  const isSystemEvent = message.messageType === MessageTypeEnum.SYSTEM_EVENT;
  const isAttachmentOnly = message.messageType === MessageTypeEnum.ATTACHMENT;
  const canEdit = isCurrentUser && !message.isUnsend && hasText && !isAttachmentOnly;

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

  const handleTogglePinMessage = useCallback(() => {
    if (isThisMessagePinned) {
      onMessagePin(message, null);
      return;
    }

    openModal({
      type: MODAL_TYPES.confirm,
      title: "Pin Message",
      description: "Select how long you want to pin this message",
      buttons: [
        ...PIN_MESSAGE_OPTIONS.map((option) => ({
          text: option.label,
          onPress: () => {
            onMessagePin(message, option.value);
            closeModal();
          },
        })),
        {
          text: "Cancel",
          onPress: closeModal,
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: "pin-outline",
    });
  }, [isThisMessagePinned, openModal, PIN_MESSAGE_OPTIONS, closeModal]);

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
        action: () => handleTogglePinMessage(),
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

      options.push({
        id: 5,
        name: "Message Info",
        iconName: "information-circle-outline",
        action: () => webMessageInfoPress && webMessageInfoPress(message.id),
      });

      if (canEdit && !isForwardedMessage) {
        options.push({
          id: 6,
          name: "Edit Message",
          iconName: "pencil" as keyof typeof Ionicons.glyphMap,
          action: () => onEditMessage?.(message),
        });
      }
    }

    if (!isCurrentUser && !message.isUnsend) {
      options.push({
        id: 7,
        name: "Mark as Unread",
        iconName: "mail-unread-outline" as keyof typeof Ionicons.glyphMap,
        action: () => onMarkMessageAsUnread(message),
      });
    }

    return options;
  }, [
    message,
    isThisMessagePinned,
    isCurrentUser,
    canEdit,
    onMessagePin,
    onStartSelectionWith,
    onUnsendMessage,
    onEditMessage,
    isSystemEvent,
    webMessageInfoPress,
    onMarkMessageAsUnread,
  ]);

  const handleLongPress = useCallback(
    (attachment?: IMessageAttachment) => {
      if (conversationAPIResponse?.isBlocked) return;
      if (selectionMode) return;
      if (isSystemEvent) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onOpenPicker(String(message.id));
      onMessageLongPress?.(message, attachment);
    },
    [
      conversationAPIResponse?.isBlocked,
      selectionMode,
      message,
      onMessageLongPress,
      onOpenPicker,
      isSystemEvent,
    ]
  );

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

  const { mutate: createConversation } = useMutation({
    mutationFn: (targetUserId: number) => createOneToOneConversation(targetUserId),
    onSuccess: (result) => {
      if (result.data) {
        router.push(CONVERSATION(result.data.id));
      } else if (result.error) {
        ToastUtils.error(result.error);
      }
    },
  });

  const handleMessageMentionedUser = useCallback(
    (user: TUser) => {
      if (currentUserId === String(user.id)) return;

      setShowProfilePreviewModal(false);
      createConversation(user.id);
    },
    [createConversation]
  );

  const addReaction = useAddMessageReactionMutation(
    undefined,
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
    undefined,
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

  const handleMentionClick = useCallback((user: TUser) => {
    if (currentUserId === String(user.id)) return;

    setSelectedPreviewUser(user);
    setShowProfilePreviewModal(true);
  }, []);

  const handleNamePress = useCallback(() => {
    if (!message.senderId || String(message.senderId) === currentUserId) return;

    const senderAsUser: TUser = {
      id: Number(message.senderId),
      username: "",
      email: "",
      firstName: message.senderFirstName || "",
      lastName: message.senderLastName || "",
      signedImageUrl: message.senderSignedImageUrl || "",
    };

    setSelectedPreviewUser(senderAsUser);
    setShowProfilePreviewModal(true);
  }, [message, currentUserId]);

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
                onPress={handleNamePress}
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
              isRead={message.isReadByEveryone}
              onClickSendernName={handleNamePress}
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
                  onBubblePress={handleBubblePress}
                  onMentionClick={handleMentionClick}
                  isMessageEdited={isMessageEdited}
                />
              </MessageHighlightWrapper>
            </View>

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

            <MentionProfileModal
              visible={showProfilePreviewModal}
              user={selectedPreviewUser}
              onClose={() => {
                setShowProfilePreviewModal(false);
                setSelectedPreviewUser(null);
              }}
              onMessagePress={handleMessageMentionedUser}
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
