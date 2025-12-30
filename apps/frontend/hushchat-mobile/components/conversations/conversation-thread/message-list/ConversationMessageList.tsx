/**
 * ConversationMessageList
 *
 * Renders the message thread for a single conversation using an inverted FlatList.
 */
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, SectionList, View, TouchableOpacity } from "react-native";
import { ConversationAPIResponse, IMessage, TPickerState } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import ActionsHeader from "@/components/conversations/conversation-thread/ActionsHeader";
import { PinnedMessageBar } from "@/components/PinnedMessageBar";
import { PLATFORM } from "@/constants/platformConstants";
import MessageReactionsModal from "@/components/conversations/conversation-thread/message-list/reaction/MessageReactionsModal";
import { DateSection } from "@/components/DateSection";
import { copyToClipboard, groupMessagesByDate } from "@/utils/messageUtils";
import { useMessageSelection } from "@/hooks/conversation-thread/useMessageSelection";
import { useMessageReactions } from "@/hooks/conversation-thread/useMessageReactions";
import { useMessageActions } from "@/hooks/conversation-thread/useMessageActions";
import { useMessageOverlays } from "@/hooks/conversation-thread/useMessageOverlays";
import { createRenderMessage } from "@/components/conversations/conversation-thread/message-list/renderMessage";
import { LoadRecentMessagesButton } from "@/components/conversations/conversation-thread/message-list/components/LoadRecentMessagesButton";
import { useRouter } from "expo-router";
import { MESSAGE_READ_PARTICIPANTS } from "@/constants/routes";

interface IMessagesListProps {
  messages: IMessage[];
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  onMessageSelect?: (message: IMessage) => void;
  conversationAPIResponse?: ConversationAPIResponse;
  pickerState: TPickerState;
  selectedConversationId: number;
  setSelectedConversation: (conversationId: number | null) => void;
  onLoadNewer: () => void;
  hasMoreNewer: boolean;
  isFetchingNewer: boolean;
  onNavigateToMessage?: (messageId: number) => void;
  targetMessageId?: number | null;
  onTargetMessageScrolled?: () => void;
  webMessageInfoPress?: (messageId: number) => void;
}

const ConversationMessageList = ({
  messages,
  onLoadMore,
  isFetchingNextPage,
  onMessageSelect,
  conversationAPIResponse,
  selectedConversationId,
  setSelectedConversation,
  onLoadNewer,
  hasMoreNewer,
  isFetchingNewer,
  onNavigateToMessage,
  targetMessageId,
  onTargetMessageScrolled,
  webMessageInfoPress,
}: IMessagesListProps) => {
  const { user } = useUserStore();
  const router = useRouter();
  const currentUserId = user?.id;
  const pinnedMessage = conversationAPIResponse?.pinnedMessage;
  const sectionListRef = useRef<SectionList>(null);
  const { reactionsModal, menuPosition, viewReactions, closeReactions } = useMessageReactions();
  const { isDark } = useAppTheme();

  const { togglePin, unSendMessage, markMessageAsUnread } = useMessageActions(
    conversationAPIResponse,
    currentUserId,
    setSelectedConversation
  );

  const {
    selectedActionMessage,
    openPickerMessageId,
    openActions,
    closeActions,
    openPicker,
    selectMessage,
    closeAll,
  } = useMessageOverlays(conversationAPIResponse, onMessageSelect);

  const { selectionMode, selectedMessageIds, startSelectionWith, toggleSelection } =
    useMessageSelection(conversationAPIResponse?.id);

  const groupedSections = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages]);

  const handlePinnedMessageClick = useCallback(() => {
    if (onNavigateToMessage && pinnedMessage) {
      onNavigateToMessage(pinnedMessage.id);
    }
  }, [onNavigateToMessage]);

  useEffect(() => {
    if (!targetMessageId || !sectionListRef.current || groupedSections.length === 0) {
      return;
    }

    let sectionIndex = -1;
    let itemIndex = -1;

    for (let i = 0; i < groupedSections.length; i++) {
      const section = groupedSections[i];
      const foundIndex = section.data.findIndex((msg) => msg.id === targetMessageId);

      if (foundIndex !== -1) {
        sectionIndex = i;
        itemIndex = foundIndex;
        break;
      }
    }

    if (sectionIndex !== -1 && itemIndex !== -1) {
      const scrollWithErrorHandling = (retryCount = 0) => {
        try {
          sectionListRef.current?.scrollToLocation({
            sectionIndex,
            itemIndex,
            animated: true,
            viewPosition: 0.5,
            viewOffset: 0,
          });

          if (onTargetMessageScrolled) {
            setTimeout(() => {
              onTargetMessageScrolled();
            }, 500);
          }
        } catch (error) {
          console.warn("failed to scroll to target message:", error);
          if (retryCount < 3) {
            setTimeout(() => scrollWithErrorHandling(retryCount + 1), 200);
          } else if (onTargetMessageScrolled) {
            onTargetMessageScrolled();
          }
        }
      };

      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          scrollWithErrorHandling();
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      if (onTargetMessageScrolled) {
        onTargetMessageScrolled();
      }
    }
  }, [targetMessageId, groupedSections, onTargetMessageScrolled]);

  const handleMessageInfoClick = useCallback((conversationId: number, messageId: number) => {
    router.push({
      pathname: MESSAGE_READ_PARTICIPANTS,
      params: { conversationId, messageId },
    });
  }, []);

  const renderMessage = useMemo(
    () =>
      createRenderMessage({
        currentUserId,
        openPickerMessageId,
        conversationAPIResponse,
        selectedMessageIds,
        startSelectionWith,
        toggleSelection,
        openActions,
        selectMessage,
        openPicker,
        closeAll,
        togglePin,
        unSendMessage,
        selectedConversationId,
        viewReactions,
        onNavigateToMessage,
        targetMessageId,
        webMessageInfoPress,
        markMessageAsUnread,
      }),
    [
      currentUserId,
      openPickerMessageId,
      conversationAPIResponse,
      selectedMessageIds,
      startSelectionWith,
      toggleSelection,
      openActions,
      selectMessage,
      openPicker,
      closeAll,
      togglePin,
      unSendMessage,
      selectedConversationId,
      viewReactions,
      onNavigateToMessage,
      targetMessageId,
      webMessageInfoPress,
      markMessageAsUnread,
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

  const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToBottom(offsetY > 300);
  };

  const scrollToBottom = () => {
    sectionListRef.current?.scrollToLocation({
      sectionIndex: 0,
      itemIndex: 0,
      animated: true,
      viewOffset: 0,
    });
  };

  return (
    <>
      {selectedActionMessage && !PLATFORM.IS_WEB && (
        <ActionsHeader
          message={selectedActionMessage}
          conversation={conversationAPIResponse}
          onClose={closeActions}
          onPinToggle={(message, duration) => togglePin(message, duration)}
          onForward={(message) => {
            startSelectionWith(message?.id);
            closeActions();
          }}
          onUnsend={(messages) => unSendMessage(messages)}
          onCopy={(message) => copyToClipboard(message.messageText)}
          onSelectMessageInfo={(conversationAPIResponse, message) =>
            handleMessageInfoClick(conversationAPIResponse.id, message.id)
          }
          onMarkAsUnread={(message) => {
            markMessageAsUnread(message);
            closeActions();
          }}
        />
      )}

      {pinnedMessage && (
        <PinnedMessageBar
          senderName={`${pinnedMessage?.senderFirstName || ""} ${pinnedMessage?.senderLastName || ""}`.trim()}
          messageText={pinnedMessage?.messageText || ""}
          onUnpin={() => togglePin(pinnedMessage)}
          onPress={handlePinnedMessageClick}
        />
      )}

      <View className="flex-1 relative">
        <SectionList
          ref={sectionListRef}
          sections={groupedSections}
          keyExtractor={(item, index) => {
            const fallbackKey = `temp-${item.conversationId}-${index}`;
            return (item.id ?? fallbackKey).toString();
          }}
          renderItem={renderMessage}
          renderSectionFooter={({ section }) => <DateSection title={section.title} />}
          inverted
          showsVerticalScrollIndicator={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderLoadingFooter}
          ListHeaderComponent={
            <LoadRecentMessagesButton
              onLoadNewer={onLoadNewer}
              hasMoreNewer={hasMoreNewer}
              isFetchingNewer={isFetchingNewer}
            />
          }
          onTouchEnd={closeAll}
          onScrollBeginDrag={closeAll}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          extraData={{
            selectionMode,
            selectedMessageIdsSize: selectedMessageIds.size,
            hasMoreNewer,
            isFetchingNewer,
            targetMessageId,
          }}
        />
        {showScrollToBottom && (
          <TouchableOpacity
            onPress={scrollToBottom}
            className="absolute bottom-6 right-4 bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow-lg z-50 items-center justify-center border border-gray-300 dark:border-gray-600"
            style={{ width: 40, height: 40, elevation: 5 }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down" size={24} color={isDark ? "#e5e7eb" : "#374151"} />
          </TouchableOpacity>
        )}
      </View>
      {reactionsModal.visible && (
        <MessageReactionsModal
          messageId={reactionsModal.messageId}
          visible={reactionsModal.visible}
          onClose={closeReactions}
          position={menuPosition}
        />
      )}
    </>
  );
};
export default ConversationMessageList;
