/**
 * ConversationMessageList
 *
 * Renders the message thread for a single conversation using an inverted FlatList.
 */
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ActivityIndicator, FlatList, View, Animated } from 'react-native';
import { ConversationAPIResponse, IBasicMessage, IMessage, TPickerState } from '@/types/chat/types';
import { useUserStore } from '@/store/user/useUserStore';
import { ConversationMessageItem } from '@/components/conversations/conversation-thread/message-list/ConversationMessageItem';
import ActionsHeader from '@/components/conversations/conversation-thread/ActionsHeader';
import { PinnedMessageBar } from '@/components/PinnedMessageBar';
import * as Haptics from 'expo-haptics';
import { PLATFORM } from '@/constants/platformConstants';
import { usePinMessageMutation } from '@/query/post/queries';
import { usePatchUnsendMessageMutation } from '@/query/patch/queries';
import { useUpdateCache } from '@/query/config/useUpdateCache';
import { useConversationStore } from '@/store/conversation/useConversationStore';
import { conversationQueryKeys, conversationMessageQueryKeys } from '@/constants/queryKeys';
import { PaginatedResponse } from '@/types/common/types';
import { ToastUtils } from '@/utils/toastUtils';
import { useConversationsQuery } from '@/query/useConversationsQuery';
import MessageReactionsModal from '@/components/conversations/conversation-thread/message-list/reaction/MessageReactionsModal';

interface MessagesListProps {
  messages: IMessage[];
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  onMessageSelect?: (message: IMessage) => void;
  conversationAPIResponse?: ConversationAPIResponse;
  pickerState: TPickerState;
  selectedConversationId: number;
  targetMessageId?: number | string | null; // NEW PROP
}

const ConversationMessageList = ({
  messages,
  onLoadMore,
  isFetchingNextPage,
  onMessageSelect,
  conversationAPIResponse,
  pickerState,
  selectedConversationId,
  targetMessageId, // NEW PROP
}: MessagesListProps) => {
  const [selectedActionMessage, setSelectedActionMessage] = useState<IMessage | null>(null);
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const { openPickerMessageId, setOpenPickerMessageId } = pickerState;
  const pinnedMessage = conversationAPIResponse?.pinnedMessage;
  const handleCloseActions = useCallback(() => setSelectedActionMessage(null), []);
  const updateCache = useUpdateCache();
  const [selectedPinnedMessage, setSelectedPinnedMessage] = useState<IBasicMessage | null>(null);
  const [unsendMessage, setUnSendMessage] = useState<IBasicMessage>({} as IBasicMessage);
  const { selectionMode, selectedMessageIds, setSelectionMode, setSelectedMessageIds } =
    useConversationStore();
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [reactionsModal, setReactionsModal] = useState<{
    visible: boolean;
    messageId: number | null;
  }>({
    visible: false,
    messageId: null,
  });

  // NEW: State for managing scroll to target message
  const flatListRef = useRef<FlatList>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<number | string | null>(null);
  const hasScrolledToTarget = useRef(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { refetch: refetchConversationList } = useConversationsQuery();

  const { mutate: togglePinMessage } = usePinMessageMutation(
    undefined,
    () => {
      setSelectedActionMessage(null);
      setOpenPickerMessageId(null);
      const pinnedMessageState =
        pinnedMessage?.id === selectedPinnedMessage?.id ? null : selectedPinnedMessage;
      updateCache(
        conversationQueryKeys.metaDataById(+!!currentUserId, Number(conversationAPIResponse?.id)),
        (prev) => (prev ? { ...prev, pinnedMessage: pinnedMessageState } : prev),
      );
    },
    (error) => {
      ToastUtils.error(error as string);
    },
  );

  const togglePin = useCallback(
    (message?: IBasicMessage) => {
      const conversationId = conversationAPIResponse?.id;
      if (!conversationId || !message) return;

      togglePinMessage({ conversationId, messageId: message.id });
      setSelectedPinnedMessage(message);
    },
    [conversationAPIResponse?.id, togglePinMessage],
  );

  const { mutate: unsend } = usePatchUnsendMessageMutation(undefined, () => {
    updateCache(
      conversationMessageQueryKeys.messages(
        Number(currentUserId),
        Number(conversationAPIResponse?.id),
      ),
      (prev: { pages: PaginatedResponse<IMessage>[] } | undefined) => {
        if (!prev) return prev;

        return {
          ...prev,
          pages: prev?.pages.map((page: PaginatedResponse<IMessage>) => ({
            ...page,
            content: page.content.map((message: IMessage) =>
              message.id === unsendMessage.id
                ? { ...message, isUnsend: true, messageAttachments: [] }
                : message,
            ),
          })),
        };
      },
    );

    void refetchConversationList();
  });

  const unSendMessage = useCallback(
    (message: IBasicMessage) => {
      setUnSendMessage(message);
      unsend({ messageId: message.id });
    },
    [unsend],
  );

  const closeAllOverlays = useCallback(() => {
    if (openPickerMessageId) setOpenPickerMessageId(null);
    if (selectedActionMessage) setSelectedActionMessage(null);
  }, [openPickerMessageId, selectedActionMessage, setOpenPickerMessageId]);

  const handleOpenPicker = useCallback(
    (messageId: string) => {
      setOpenPickerMessageId(messageId);
    },
    [setOpenPickerMessageId],
  );

  const handleMessageSelect = useCallback(
    (message: IMessage) => {
      setOpenPickerMessageId(null);
      onMessageSelect?.(message);
    },
    [onMessageSelect, setOpenPickerMessageId],
  );

  const handleMessageLongPress = useCallback(
    (message: IMessage) => {
      if (conversationAPIResponse?.isBlocked) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedActionMessage(message);
    },
    [conversationAPIResponse?.isBlocked],
  );

  const handleStartSelectionWith = useCallback(
    (messageId: number) => {
      if (!conversationAPIResponse?.id) return;
      setSelectionMode(true);
      setSelectedMessageIds(new Set([messageId]));
      setSelectedActionMessage(null);
    },
    [conversationAPIResponse?.id, setSelectionMode, setSelectedMessageIds],
  );

  const handleToggleSelection = useCallback(
    (messageId: number) => {
      const messageIds = new Set<number>(selectedMessageIds);
      if (messageIds.has(messageId)) messageIds.delete(messageId);
      else messageIds.add(messageId);
      if (messageIds.size === 0) setSelectionMode(false);
      setSelectedMessageIds(messageIds);
    },
    [selectedMessageIds, setSelectedMessageIds, setSelectionMode],
  );

  const handleViewReactions = useCallback(
    (messageId: number, position: { x: number; y: number }, isOpen: boolean) => {
      setMenuPosition(position);
      setReactionsModal({
        visible: isOpen,
        messageId,
      });
    },
    [],
  );

  const handleCloseReactions = useCallback(() => {
    setReactionsModal((prev) => ({ ...prev, visible: false }));
  }, []);

  // NEW: Scroll to target message when it's loaded
  useEffect(() => {
    if (targetMessageId && !hasScrolledToTarget.current && messages.length > 0) {
      const messageIndex = messages.findIndex(
        (msg) => String(msg.id) === String(targetMessageId)
      );

      if (messageIndex !== -1) {
        hasScrolledToTarget.current = true;

        // Wait for the list to render
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: messageIndex,
            animated: true,
            viewPosition: 0.5, // Center the message
          });

          // Highlight the message
          setHighlightedMessageId(targetMessageId);

          // Start fade animation
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0.3,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Remove highlight after animation
            setTimeout(() => {
              setHighlightedMessageId(null);
            }, 500);
          });
        }, 300);
      }
    }
  }, [targetMessageId, messages, fadeAnim]);

  // NEW: Reset scroll flag when conversation changes
  useEffect(() => {
    hasScrolledToTarget.current = false;
    setHighlightedMessageId(null);
    fadeAnim.setValue(1);
  }, [selectedConversationId, fadeAnim]);

  // NEW: Handle scroll to index failures
  const handleScrollToIndexFailed = useCallback((info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    // Wait for items to be measured, then try again
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 100);
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: IMessage }) => {
      const isCurrentUser = currentUserId && Number(currentUserId) === item.senderId;
      const isSelected = selectedMessageIds.has(Number(item.id));
      const isHighlighted = String(highlightedMessageId) === String(item.id);

      return (
        <View
          style={{
            opacity: isHighlighted ? fadeAnim : 1,
          }}
        >
          <View
            className={`${
              isHighlighted 
                ? 'bg-yellow-100 dark:bg-yellow-900/20 -mx-4 px-4' 
                : ''
            }`}
          >
            <ConversationMessageItem
              message={item}
              isCurrentUser={!!isCurrentUser}
              currentUserId={String(currentUserId)}
              isPickerOpen={openPickerMessageId === String(item.id)}
              onOpenPicker={handleOpenPicker}
              onMessageSelect={handleMessageSelect}
              conversationAPIResponse={conversationAPIResponse}
              selected={isSelected}
              onStartSelectionWith={handleStartSelectionWith}
              onToggleSelection={handleToggleSelection}
              onMessageLongPress={handleMessageLongPress}
              onCloseAllOverlays={closeAllOverlays}
              onMessagePin={(message) => togglePin(message)}
              onUnsendMessage={(message) => unSendMessage(message)}
              selectedConversationId={selectedConversationId}
              onViewReactions={handleViewReactions}
              isHighlighted={String(highlightedMessageId) === String(item.id)} // NEW PROP
              fadeAnim={fadeAnim}
            />
          </View>
        </View>
      );
    },
    [
      currentUserId,
      openPickerMessageId,
      handleOpenPicker,
      handleMessageSelect,
      conversationAPIResponse,
      selectedMessageIds,
      handleStartSelectionWith,
      handleToggleSelection,
      handleMessageLongPress,
      closeAllOverlays,
      togglePin,
      selectedConversationId,
      unSendMessage,
      handleViewReactions,
      highlightedMessageId,
      fadeAnim,
    ],
  );

  const renderLoadingFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }, [isFetchingNextPage]);

  return (
    <>
      {selectedActionMessage && !PLATFORM.IS_WEB && (
        <ActionsHeader
          message={selectedActionMessage}
          conversation={conversationAPIResponse}
          onClose={handleCloseActions}
          onPinToggle={(message) => togglePin(message)}
          onForward={(message) => {
            handleStartSelectionWith(message?.id);
            handleCloseActions();
          }}
          onUnsend={(messages) => unSendMessage(messages)}
        />
      )}

      {pinnedMessage && (
        <PinnedMessageBar
          senderName={`${pinnedMessage?.senderFirstName || ''} ${pinnedMessage?.senderLastName || ''}`.trim()}
          messageText={pinnedMessage?.messageText || ''}
          onUnpin={() => togglePin(pinnedMessage)}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id?.toString()}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        inverted
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderLoadingFooter}
        onScrollBeginDrag={closeAllOverlays}
        onTouchEnd={closeAllOverlays}
        onMomentumScrollBegin={closeAllOverlays}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        extraData={{ 
          selectionMode, 
          selectedMessageIdsSize: selectedMessageIds.size,
          highlightedMessageId,
        }}
      />
      {reactionsModal.visible && (
        <MessageReactionsModal
          messageId={reactionsModal.messageId}
          visible={reactionsModal.visible}
          onClose={handleCloseReactions}
          position={menuPosition}
        />
      )}
    </>
  );
};

export default ConversationMessageList;