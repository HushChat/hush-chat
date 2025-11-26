/**
 * ConversationMessageList
 *
 * Renders the message thread for a single conversation using an inverted FlatList.
 */
import React, { useCallback, useMemo } from "react";
import { ActivityIndicator, SectionList, View } from "react-native";
import { ConversationAPIResponse, IMessage, TPickerState } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import ActionsHeader from "@/components/conversations/conversation-thread/ActionsHeader";
import { PinnedMessageBar } from "@/components/PinnedMessageBar";
import { PLATFORM } from "@/constants/platformConstants";
import MessageReactionsModal from "@/components/conversations/conversation-thread/message-list/reaction/MessageReactionsModal";
import { DateSection } from "@/components/DateSection";
import { groupMessagesByDate } from "@/utils/messageUtils";
import { useMessageSelection } from "@/hooks/conversation-thread/useMessageSelection";
import { useMessageReactions } from "@/hooks/conversation-thread/useMessageReactions";
import { useMessageActions } from "@/hooks/conversation-thread/useMessageActions";
import { useMessageOverlays } from "@/hooks/conversation-thread/useMessageOverlays";
import { createRenderMessage } from "@/components/conversations/conversation-thread/message-list/renderMessage";
import { LoadRecentMessagesButton } from "@/components/conversations/conversation-thread/message-list/components/LoadRecentMessagesButton";

interface IMessagesListProps {
  messages: IMessage[];
  onLoadMore: () => void;
  isFetchingNextPage: boolean;
  onMessageSelect?: (message: IMessage) => void;
  conversationAPIResponse?: ConversationAPIResponse;
  pickerState: TPickerState;
  selectedConversationId: number;
  onLoadNewer: () => void;
  hasMoreNewer: boolean;
  isFetchingNewer: boolean;
}

const ConversationMessageList = ({
  messages,
  onLoadMore,
  isFetchingNextPage,
  onMessageSelect,
  conversationAPIResponse,
  selectedConversationId,
  onLoadNewer,
  hasMoreNewer,
  isFetchingNewer,
}: IMessagesListProps) => {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const pinnedMessage = conversationAPIResponse?.pinnedMessage;
  const { reactionsModal, menuPosition, viewReactions, closeReactions } = useMessageReactions();

  const { togglePin, unSendMessage } = useMessageActions(conversationAPIResponse, currentUserId);

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
          onClose={closeActions}
          onPinToggle={(message) => togglePin(message)}
          onForward={(message) => {
            startSelectionWith(message?.id);
            closeActions();
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
        extraData={{
          selectionMode,
          selectedMessageIdsSize: selectedMessageIds.size,
          hasMoreNewer,
          isFetchingNewer,
        }}
      />
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
