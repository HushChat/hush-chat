/**
 * ConversationMessageItem
 * Renders a single message bubble within a conversation thread.
 */

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GestureResponderEvent, Pressable, View } from 'react-native';
import { format } from 'date-fns';
import {
  ConversationAPIResponse,
  IMessage,
  IOption,
  ReactionType,
  IMessageAttachment,
} from '@/types/chat/types';
import classNames from 'classnames';
import { PLATFORM } from '@/constants/platformConstants';
import ReactionPicker from '@/components/conversations/conversation-thread/message-list/reaction/ReactionPicker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import ParentMessagePreview from './ParentMessagePreview';
import WebContextMenu from '@/components/WebContextMenu';
import FormattedText from '@/components/FormattedText';
import { SwipeableMessageRow } from '@/gestures/components/SwipeableMessageRow';
import { ForwardedLabel } from '@/components/conversations/conversation-thread/composer/ForwardedLabel';
import { useAddMessageReactionMutation } from '@/query/post/queries';
import { useRemoveMessageReactionMutation } from '@/query/delete/queries';
import { ToastUtils } from '@/utils/toastUtils';
import { useUserStore } from '@/store/user/useUserStore';
import { getAPIErrorMsg } from '@/utils/commonUtils';
import { useConversationStore } from '@/store/conversation/useConversationStore';
import UnsendMessagePreview from '@/components/UnsendMessagePreview';
import { renderFileGrid } from '@/components/conversations/conversation-thread/message-list/file-upload/renderFileGrid';
import { AppText } from '@/components/AppText';
import MessageReactionsSummary from '@/components/conversations/conversation-thread/message-list/reaction/MessageReactionSummary';

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
  isHighlighted?: boolean;
  fadeAnim?: Animated.Value;
}

const REMOVE_ONE = 1;
const ADD_ONE = 1;
const MIN_COUNT = 0;

const isImageAttachment = (att: IMessageAttachment) => {
  const name = (att.originalFileName || att.indexedFileName || '').toLowerCase();
  const byExt = /\.(jpe?g|png|gif|webp|svg)$/.test(name);
  const byMime = att?.mimeType?.startsWith?.('image/');
  return Boolean(byExt || byMime);
};

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

  const hasImages = () => attachments.some(isImageAttachment);

  const [webMenuVisible, setWebMenuVisible] = useState<boolean>(false);
  const [webMenuPos, setWebMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinnedMessageId = conversationAPIResponse?.pinnedMessage?.id;
  const isThisMessagePinned = pinnedMessageId === message.id;
  const parentMessage = message.parentMessage;
  const [reactionSummary, setReactionSummary] = useState(
    message.reactionSummary || { counts: {}, currentUserReaction: '' },
  );
  const reactedByCurrentUser = reactionSummary?.currentUserReaction || '';
  const {
    user: { id: userId },
  } = useUserStore();
  const { selectionMode } = useConversationStore();

  const messageContent = message.messageText;
  const isForwardedMessage = message.isForwarded;

  const messageTime = useMemo(
    () => format(new Date(message.createdAt), 'h:mm a'),
    [message.createdAt],
  );
  useEffect(() => {
    if (message.reactionSummary) setReactionSummary(message.reactionSummary);
  }, [message.reactionSummary]);

  const hasReactions = useMemo(
    () => Object.values(reactionSummary?.counts || {}).some((count) => (count || 0) > 0),
    [reactionSummary],
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
    [selectionMode],
  );

  const handleWebMenuClose = useCallback(() => setWebMenuVisible(false), []);

  const webOptions: IOption[] = useMemo(() => {
    if (message.isUnsend) {
      return [];
    }

    const options: IOption[] = [
      {
        id: 1,
        name: isThisMessagePinned ? 'Unpin Message' : 'Pin Message',
        iconName: (isThisMessagePinned ? 'pin' : 'pin-outline') as keyof typeof Ionicons.glyphMap,
        action: () => onMessagePin(message),
      },
      {
        id: 2,
        name: 'Select message',
        iconName: 'checkmark-circle-outline',
        action: () => onStartSelectionWith(Number(message.id)),
      },
    ];
    if (isCurrentUser && !message.isUnsend) {
      options.push({
        id: 3,
        name: 'Unsend Message',
        iconName: 'ban' as keyof typeof Ionicons.glyphMap,
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
    () => {},
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    },
  );

  const removeReaction = useRemoveMessageReactionMutation(
    { userId: Number(userId), conversationId: selectedConversationId },
    () => {},
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    },
  );

  const handleViewReactions = useCallback(
    (position: { x: number; y: number }, isOpen: boolean) =>
      onViewReactions(message.id, position, isOpen),
    [message.id, onViewReactions],
  );

  const handleSelectReaction = useCallback(
    async (newReaction: ReactionType) => {
      if (conversationAPIResponse?.isBlocked) return;
      if (selectionMode) return;

      const previousReaction = reactionSummary?.currentUserReaction || '';
      const reactionCounts = { ...(reactionSummary?.counts ?? {}) };
      onCloseAllOverlays?.();

      if (previousReaction === newReaction) {
        removeReaction.mutate(message.id, {
          onSuccess: () => {
            reactionCounts[newReaction] = Math.max(
              MIN_COUNT,
              (reactionCounts[newReaction] ?? 0) - REMOVE_ONE,
            );
            setReactionSummary({ counts: reactionCounts, currentUserReaction: '' });
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
                (reactionCounts[previousReaction] ?? 0) - REMOVE_ONE,
              );
            }
            reactionCounts[newReaction] = (reactionCounts[newReaction] ?? 0) + ADD_ONE;
            setReactionSummary({ counts: reactionCounts, currentUserReaction: newReaction });
          },
        },
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
    ],
  );

  const hoverVisibilityClass = PLATFORM.IS_WEB
    ? 'opacity-0 group-hover:opacity-100 hover:opacity-100'
    : 'opacity-100';

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

  const hasText = !!message.messageText;

  const ContentBlock = () => (
    <Animated.View style={{ backgroundColor: 'transparent' }}>
      <View className="group mb-3">
        <View className="mx-4">
          <View
            className={classNames('flex-row items-center gap-2 mb-1', {
              'justify-end': isCurrentUser,
              'justify-start': !isCurrentUser,
            })}
          >
            {isCurrentUser && PLATFORM.IS_WEB && !message.isUnsend && (
              <View className="flex-row items-center">
                <Pressable
                  onPress={handleOpenPicker}
                  disabled={!currentUserId}
                  className={hoverVisibilityClass}
                  style={({ pressed }) => ({
                    minWidth: 24,
                    minHeight: 24,
                    opacity: pressed ? 0.7 : 1,
                    cursor: 'pointer',
                  })}
                >
                  <View className="p-1 rounded items-center justify-center">
                    <Ionicons name="happy-outline" size={16} color="#9CA3AF" />
                  </View>
                </Pressable>

                <Pressable
                  onPress={openWebMenuAtEvent}
                  disabled={selectionMode}
                  className={hoverVisibilityClass}
                  style={({ pressed }) => ({
                    minWidth: 24,
                    minHeight: 24,
                    marginLeft: 6,
                    opacity: pressed ? 0.7 : 1,
                    cursor: 'pointer',
                  })}
                >
                  <View className="p-1 rounded items-center justify-center">
                    <Ionicons name="chevron-down-outline" size={16} color="#9CA3AF" />
                  </View>
                </Pressable>
              </View>
            )}

            {conversationAPIResponse?.isGroup && (
              <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                {isCurrentUser
                  ? 'You'
                  : `${message.senderFirstName || ''} ${message.senderLastName || ''}`.trim() ||
                    'Unknown User'}
              </AppText>
            )}

            <AppText className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {messageTime}
            </AppText>

            {!isCurrentUser && PLATFORM.IS_WEB && !message.isUnsend && (
              <View className="flex-row items-center">
                <Pressable
                  onPress={handleOpenPicker}
                  disabled={!currentUserId || selectionMode}
                  className={hoverVisibilityClass}
                  style={({ pressed }) => ({
                    minWidth: 24,
                    minHeight: 24,
                    opacity: pressed ? 0.7 : 1,
                    cursor: 'pointer',
                  })}
                >
                  <View className="p-1 rounded items-center justify-center">
                    <Ionicons name="happy-outline" size={16} color="#9CA3AF" />
                  </View>
                </Pressable>
                <Pressable
                  onPress={openWebMenuAtEvent}
                  disabled={selectionMode}
                  className={hoverVisibilityClass}
                  style={({ pressed }) => ({
                    minWidth: 24,
                    minHeight: 24,
                    marginLeft: 6,
                    opacity: pressed ? 0.7 : 1,
                    cursor: 'pointer',
                  })}
                >
                  <View className="p-1 rounded items-center justify-center">
                    <Ionicons name="chevron-down-outline" size={16} color="#9CA3AF" />
                  </View>
                </Pressable>
              </View>
            )}
          </View>

          {renderParentMessage()}

          <Pressable onPress={handleBubblePress} disabled={!messageContent && !hasAttachments}>
            {selectionMode && (
              <View
                style={{
                  position: 'absolute',
                  top: -6,
                  left: isCurrentUser ? undefined : -6,
                  right: isCurrentUser ? -6 : undefined,
                  zIndex: 10,
                }}
              >
                <Ionicons
                  name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={selected ? '#3B82F6' : '#9CA3AF'}
                />
              </View>
            )}

            <View className={classNames('rounded-xl', isCurrentUser ? 'items-end' : 'items-start')}>
              <ForwardedLabel
                isForwardedMessage={isForwardedMessage}
                isCurrentUser={isCurrentUser}
              />

              <View
                className={classNames(
                  'rounded-lg border-2',
                  hasText || hasImages()
                    ? isCurrentUser
                      ? 'bg-primary-light dark:bg-primary-dark rounded-tr-none'
                      : 'bg-secondary-light dark:bg-secondary-dark rounded-tl-none'
                    : 'bg-transparent',
                  selected && selectionMode
                    ? 'border-sky-500 dark:border-sky-400'
                    : 'border-transparent',
                  isForwardedMessage && 'shadow-sm',
                  hasImages() && !messageContent ? '' : 'px-3 py-2',
                )}
                style={{
                  maxWidth: hasAttachments ? 305 : '70%',
                  ...(isForwardedMessage &&
                    !isCurrentUser && {
                      borderLeftWidth: 2,
                      borderLeftColor: '#9CA3AF30',
                    }),
                  ...(isForwardedMessage &&
                    isCurrentUser && {
                      borderRightWidth: 2,
                      borderRightColor: '#60A5FA30',
                    }),
                }}
              >
                {hasAttachments && (
                  <View className={messageContent ? 'mb-2' : ''}>
                    {renderFileGrid(attachments, isCurrentUser)}
                  </View>
                )}

                {!message.isUnsend && messageContent ? (
                  <FormattedText
                    text={message.messageText}
                    style={{ fontSize: 16, lineHeight: 20, fontFamily: 'Poppins-Regular' }}
                    mentions={message.mentions}
                    isCurrentUser={isCurrentUser}
                  />
                ) : message.isUnsend ? (
                  <UnsendMessagePreview unsendMessage={message} />
                ) : null}
              </View>
            </View>
          </Pressable>

          {!message.isUnsend && (
            <ReactionPicker
              visible={isPickerOpen && !conversationAPIResponse?.isBlocked && !selectionMode}
              reactedByCurrentUser={reactedByCurrentUser}
              onSelect={handleSelectReaction}
              isCurrentUser={isCurrentUser}
              onRequestClose={onCloseAllOverlays}
            />
          )}

          {hasReactions && !message.isUnsend && (
            <View
              className={classNames('mt-1', {
                'items-start': !isCurrentUser,
                'items-end': isCurrentUser,
              })}
            >
              <MessageReactionsSummary
                reactions={reactionSummary}
                isCurrentUser={isCurrentUser}
                onPress={handleViewReactions}
              />
            </View>
          )}
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
              console.error('Error executing context menu action:', error);
            }
          }}
        />
      )}
    </Animated.View>
  );

  if (PLATFORM.IS_WEB) {
    return (
      <div
        onDoubleClick={() => {
          if (message.isUnsend) return;
          if (conversationAPIResponse?.isBlocked) return;
          onMessageSelect?.(message);
        }}
        style={{ display: 'contents' }}
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
