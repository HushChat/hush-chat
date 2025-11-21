import React from "react";
import { SectionListData } from "react-native";
import { ConversationMessageItem } from "@/components/conversations/conversation-thread/message-list/ConversationMessageItem";
import { IMessage, ConversationAPIResponse } from "@/types/chat/types";
import { shouldShowSenderAvatar } from "@/utils/messageUtils";

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
}

export const createRenderMessage = (params: IRenderMessageParams) => {
  const RenderMessage = ({
    item,
    index,
    section,
  }: {
    item: IMessage;
    index: number;
    section: SectionListData<IMessage>;
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
    } = params;

    const isCurrentUser = currentUserId && Number(currentUserId) === item.senderId;
    const isSelected = selectedMessageIds.has(Number(item.id));

    const showSenderAvatar = shouldShowSenderAvatar(
      section.data,
      index,
      !!conversationAPIResponse?.isGroup,
      !!isCurrentUser
    );

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
        onStartSelectionWith={startSelectionWith}
        onToggleSelection={toggleSelection}
        onMessageLongPress={openActions}
        onCloseAllOverlays={closeAll}
        onMessagePin={togglePin}
        onUnsendMessage={unSendMessage}
        selectedConversationId={selectedConversationId}
        onViewReactions={viewReactions}
        showSenderAvatar={showSenderAvatar}
      />
    );
  };

  RenderMessage.displayName = "RenderMessage";

  return RenderMessage;
};
