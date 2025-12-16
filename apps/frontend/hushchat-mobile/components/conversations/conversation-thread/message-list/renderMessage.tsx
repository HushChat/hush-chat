import React from "react";
import { SectionListData } from "react-native";
import { ConversationMessageItem } from "@/components/conversations/conversation-thread/message-list/ConversationMessageItem";
import { IMessage, ConversationAPIResponse } from "@/types/chat/types";
import { shouldShowSenderAvatar, shouldShowSenderName } from "@/utils/messageUtils";
import { getGroupMessages, GroupedMessage, isImageGroup } from "@/hooks/useGroupedMessages";

interface IRenderMessageParams {
  currentUserId: number | null | undefined;
  openPickerMessageId: string | null;
  conversationAPIResponse?: ConversationAPIResponse;
  selectedMessageIds: Set<number>;
  startSelectionWith: (id: number) => void;
  toggleSelection: (id: number) => void;
  openActions: (msg: IMessage) => void;
  selectMessage: (msg: IMessage) => void;
  openPicker: (id: string) => void;
  closeAll: () => void;
  togglePin: (msg: IMessage) => void;
  unSendMessage: (msg: IMessage) => void;
  selectedConversationId: number;
  viewReactions: (messageId: number, position: { x: number; y: number }, isOpen: boolean) => void;
  onNavigateToMessage?: (messageId: number) => void;
}

export const createRenderMessage = (params: IRenderMessageParams) => {
  const RenderMessage = ({
    item,
    index,
    section,
  }: {
    item: GroupedMessage;
    index: number;
    section: SectionListData<GroupedMessage>;
  }) => {
    const {
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
    } = params;

    const isCurrentUser = currentUserId && Number(currentUserId) === item.senderId;

    // For image groups, check if ANY message in the group is selected
    const groupMessages = getGroupMessages(item);
    const isSelected = groupMessages.some((msg) => selectedMessageIds.has(Number(msg.id)));

    const showSenderAvatar = shouldShowSenderAvatar(
      section.data,
      index,
      !!conversationAPIResponse?.isGroup,
      !!isCurrentUser
    );

    const showSenderName = shouldShowSenderName(
      section.data,
      index,
      !!conversationAPIResponse?.isGroup
    );

    // Handle selection toggle for image groups
    const handleToggleSelection = (messageId: number) => {
      if (isImageGroup(item)) {
        // Toggle all messages in the group
        groupMessages.forEach((msg) => {
          if (msg.id) toggleSelection(Number(msg.id));
        });
      } else {
        toggleSelection(messageId);
      }
    };

    // Handle start selection for image groups
    const handleStartSelectionWith = (messageId: number) => {
      if (isImageGroup(item)) {
        // Start selection with all messages in the group
        groupMessages.forEach((msg) => {
          if (msg.id) startSelectionWith(Number(msg.id));
        });
      } else {
        startSelectionWith(messageId);
      }
    };

    return (
      <ConversationMessageItem
        message={item}
        isCurrentUser={!!isCurrentUser}
        currentUserId={String(currentUserId)}
        isPickerOpen={openPickerMessageId === String(item.id)}
        onOpenPicker={openPicker}
        onMessageSelect={selectMessage}
        conversationAPIResponse={conversationAPIResponse}
        selected={isSelected}
        onStartSelectionWith={handleStartSelectionWith}
        onToggleSelection={handleToggleSelection}
        onMessageLongPress={openActions}
        onCloseAllOverlays={closeAll}
        onMessagePin={togglePin}
        onUnsendMessage={unSendMessage}
        selectedConversationId={selectedConversationId}
        onViewReactions={viewReactions}
        showSenderAvatar={showSenderAvatar}
        showSenderName={showSenderName}
        onNavigateToMessage={onNavigateToMessage}
        // Pass grouped messages info
        isImageGroup={isImageGroup(item)}
        groupedMessages={isImageGroup(item) ? groupMessages : undefined}
      />
    );
  };

  RenderMessage.displayName = "RenderMessage";

  return RenderMessage;
};
