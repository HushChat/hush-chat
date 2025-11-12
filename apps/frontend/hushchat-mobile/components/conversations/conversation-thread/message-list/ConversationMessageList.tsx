/**
 * ConversationMessageList
 *
 * Renders the message thread for a single conversation using an inverted FlatList.
 */
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, SectionList, View } from "react-native";
import { ConversationAPIResponse, IBasicMessage, IMessage, TPickerState } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import { ConversationMessageItem } from "@/components/conversations/conversation-thread/message-list/ConversationMessageItem";
import ActionsHeader from "@/components/conversations/conversation-thread/ActionsHeader";
import { PinnedMessageBar } from "@/components/PinnedMessageBar";
import * as Haptics from "expo-haptics";
import { PLATFORM } from "@/constants/platformConstants";
import { usePinMessageMutation } from "@/query/post/queries";
import { usePatchUnsendMessageMutation } from "@/query/patch/queries";
import { useUpdateCache } from "@/query/config/useUpdateCache";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { conversationQueryKeys, conversationMessageQueryKeys } from "@/constants/queryKeys";
import { PaginatedResponse } from "@/types/common/types";
import { ToastUtils } from "@/utils/toastUtils";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { AppText } from "@/components/AppText";
import { groupMessagesByDate } from "@/utils/messageUtils";
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import MessageReactionsModal from "@/components/conversations/conversation-thread/message-list/reaction/MessageReactionsModal";

interface MessagesListProps {
  messages: IMessage[];
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  onMessageSelect?: (message: IMessage) => void;
  conversationAPIResponse?: ConversationAPIResponse;
  pickerState: TPickerState;
  selectedConversationId: number;
}

const SectionFooter = (({ title }: { title: string }) => (
  <View className="items-center my-2">
    <View className="dark:bg-secondary-dark bg-secondary-light rounded-full px-3 py-1">
      <AppText className="text-xs dark:!text-gray-300 text-gray-700 font-medium">{title}</AppText>
    </View>
  </View>
));

const ConversationMessageList = ({
  messages,
  onLoadMore,
  isFetchingNextPage,
  onMessageSelect,
  conversationAPIResponse,
  pickerState,
  selectedConversationId,
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

  const { refetch: refetchConversationList } = useConversationsQuery();

  const { mutate: togglePinMessage } = usePinMessageMutation(
    undefined,
    () => {
      setSelectedActionMessage(null);
      setOpenPickerMessageId(null);
      const pinnedMessageState =
        pinnedMessage?.id === selectedPinnedMessage?.id ? null : selectedPinnedMessage;
      updateCache(
        conversationQueryKeys.metaDataById(
          Number(currentUserId ?? 0),
          Number(conversationAPIResponse?.id)
        ),
        (prev) => (prev ? { ...prev, pinnedMessage: pinnedMessageState } : prev)
      );
    },
    (error) => {
      ToastUtils.error(error as string);
    }
  );

  const togglePin = useCallback(
    (message?: IBasicMessage) => {
      const conversationId = conversationAPIResponse?.id;
      if (!conversationId || !message) return;

      togglePinMessage({ conversationId, messageId: message.id });
      console.log(message);
      setSelectedPinnedMessage(message);
    },
    [conversationAPIResponse?.id, togglePinMessage]
  );

  const { mutate: unsend } = usePatchUnsendMessageMutation(undefined, () => {
    // update conversation message in cache
    updateCache(
      conversationMessageQueryKeys.messages(
        Number(currentUserId),
        Number(conversationAPIResponse?.id)
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
                : message
            ),
          })),
        };
      }
    );

    void refetchConversationList();
  });

  const unSendMessage = useCallback(
    (message: IBasicMessage) => {
      setUnSendMessage(message);
      unsend({ messageId: message.id });
    },
    [unsend]
  );

  const closeAllOverlays = useCallback(() => {
    if (openPickerMessageId) setOpenPickerMessageId(null);
    if (selectedActionMessage) setSelectedActionMessage(null);
  }, [openPickerMessageId, selectedActionMessage, setOpenPickerMessageId]);

  const handleOpenPicker = useCallback(
    (messageId: string) => {
      setOpenPickerMessageId(messageId);
    },
    [setOpenPickerMessageId]
  );

  const handleMessageSelect = useCallback(
    (message: IMessage) => {
      setOpenPickerMessageId(null);
      onMessageSelect?.(message);
    },
    [onMessageSelect, setOpenPickerMessageId]
  );

  const handleMessageLongPress = useCallback(
    (message: IMessage) => {
      if (conversationAPIResponse?.isBlocked) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedActionMessage(message);
    },
    [conversationAPIResponse?.isBlocked]
  );

  const handleStartSelectionWith = useCallback(
    (messageId: number) => {
      if (!conversationAPIResponse?.id) return;
      setSelectionMode(true);
      setSelectedMessageIds(new Set([messageId]));
      setSelectedActionMessage(null);
    },
    [conversationAPIResponse?.id, setSelectionMode, setSelectedMessageIds]
  );

  const handleToggleSelection = useCallback(
    (messageId: number) => {
      const messageIds = new Set<number>(selectedMessageIds);
      if (messageIds.has(messageId)) messageIds.delete(messageId);
      else messageIds.add(messageId);
      if (messageIds.size === 0) setSelectionMode(false);
      setSelectedMessageIds(messageIds);
    },
    [selectedMessageIds, setSelectedMessageIds, setSelectionMode]
  );

  const handleViewReactions = useCallback(
    (messageId: number, position: { x: number; y: number }, isOpen: boolean) => {
      setMenuPosition(position);
      setReactionsModal({
        visible: isOpen,
        messageId,
      });
    },
    []
  );

  const handleCloseReactions = useCallback(() => {
    setReactionsModal((prev) => ({ ...prev, visible: false }));
  }, []);

  const groupedSections = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  const renderMessage = useCallback(
    ({ item }: { item: IMessage }) => {
      const isCurrentUser = currentUserId && Number(currentUserId) === item.senderId;
      const isSelected = selectedMessageIds.has(Number(item.id));
      return (
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
        />
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
    ]
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
          senderName={`${pinnedMessage?.senderFirstName || ""} ${pinnedMessage?.senderLastName || ""}`.trim()}
          messageText={pinnedMessage?.messageText || ""}
          onUnpin={() => togglePin(pinnedMessage)}
        />
      )}

      <SectionList
        sections={groupedSections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        renderSectionFooter={({ section }) => <SectionFooter title={section.title} />}
        inverted
        showsVerticalScrollIndicator={false}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderLoadingFooter}
        onScrollBeginDrag={closeAllOverlays}
        onTouchEnd={closeAllOverlays}
        onMomentumScrollBegin={closeAllOverlays}
        extraData={{
          selectionMode,
          selectedMessageIdsSize: selectedMessageIds.size,
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
