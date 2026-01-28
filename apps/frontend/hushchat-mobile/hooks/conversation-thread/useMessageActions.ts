import { useCallback, useState } from "react";
import { usePinMessageMutation } from "@/query/post/queries";
import {
  useMarkMessageAsUnreadMutation,
  usePatchUnsendMessageMutation,
} from "@/query/patch/queries";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { useUpdateCache } from "@/query/config/useUpdateCache";
import { ToastUtils } from "@/utils/toastUtils";
import { PaginatedResponse } from "@/types/common/types";
import { conversationQueryKeys, conversationMessageQueryKeys } from "@/constants/queryKeys";
import {
  IBasicMessage,
  IMessage,
  ConversationAPIResponse,
  MessageTypeEnum,
} from "@/types/chat/types";
import { useRouter } from "expo-router";
import { CHATS_PATH } from "@/constants/routes";
import { useUserStore } from "@/store/user/useUserStore";
import { getCriteria } from "@/utils/conversationUtils";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";

export const buildSystemPinMessage = (
  conversationId: number,
  userId: number,
  isUnpin: boolean
): IMessage => ({
  id: Date.now(),
  senderId: userId,
  senderFirstName: "You",
  senderLastName: "",
  messageText: isUnpin ? "You unpinned a message today" : "You pinned a message today",
  createdAt: new Date().toISOString(),
  conversationId,
  isForwarded: false,
  isUnsend: false,
  messageType: MessageTypeEnum.SYSTEM_EVENT,
});

export function useMessageActions(
  conversation: ConversationAPIResponse | undefined,
  currentUserId: number | null | undefined,
  setSelectedConversation: (conversationId: number | null) => void
) {
  const updateCache = useUpdateCache();
  const router = useRouter();
  const { selectedConversationType } = useConversationStore();
  const {
    user: { id: userId },
  } = useUserStore();
  const criteria = getCriteria(selectedConversationType);

  const [selectedPinnedMessage, setSelectedPinnedMessage] = useState<IBasicMessage | null>(null);
  const [unsendMessageState, setUnsendMessageState] = useState<IBasicMessage | null>(null);

  const { refetch: refetchConversationList } = useConversationsQuery();
  const { updateConversationMessagesCache, updateConversationsListCache } =
    useConversationMessagesQuery(Number(conversation?.id), {
      enabled: false,
    });

  /**
   * Pin/Unpin Messages
   */
  const { mutate: togglePinMessage } = usePinMessageMutation(
    undefined,
    () => {
      if (!conversation || !selectedPinnedMessage || !currentUserId) {
        return;
      }

      const isUnpinAction = conversation.pinnedMessage?.id === selectedPinnedMessage.id;

      updateCache(
        conversationQueryKeys.metaDataById(Number(currentUserId), Number(conversation.id)),
        (previousConversation) => {
          if (!previousConversation) {
            return previousConversation;
          }

          return {
            ...previousConversation,
            pinnedMessage: isUnpinAction ? null : selectedPinnedMessage,
          };
        }
      );

      const systemMessage = buildSystemPinMessage(
        conversation.id,
        Number(currentUserId),
        isUnpinAction
      );

      updateConversationMessagesCache(systemMessage);
      updateConversationsListCache(systemMessage);
    },
    (error) => {
      ToastUtils.error(error as string);
    }
  );

  const togglePin = useCallback(
    (message?: IBasicMessage, duration?: string | null) => {
      const conversationId = conversation?.id;
      if (!conversationId || !message) return;

      setSelectedPinnedMessage(message);
      togglePinMessage({ conversationId, messageId: message.id, duration });
    },
    [conversation?.id, togglePinMessage]
  );

  /**
   * Unsend Message
   */
  const { mutate: unsend } = usePatchUnsendMessageMutation(undefined, () => {
    if (!conversation?.id || !currentUserId || !unsendMessageState) return;

    updateCache(
      conversationMessageQueryKeys.messages(Number(currentUserId), Number(conversation.id)),
      (prev: { pages: PaginatedResponse<IMessage>[] } | undefined) => {
        if (!prev) return prev;

        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            content: page.content.map((msg) =>
              msg.id === unsendMessageState.id
                ? {
                    ...msg,
                    isUnsend: true,
                    messageAttachments: [],
                    isForwarded: false,
                  }
                : msg
            ),
          })),
        };
      }
    );

    void refetchConversationList();
  });

  const unSendMessage = useCallback(
    (message: IBasicMessage) => {
      setUnsendMessageState(message);
      unsend({ messageId: message.id });
    },
    [unsend]
  );

  /**
   * Mark Message as Unread
   */
  const { mutate: markAsUnread } = useMarkMessageAsUnreadMutation(
    {
      userId: userId,
      criteria: criteria,
    },
    () => {
      setSelectedConversation(null);
      router.push(CHATS_PATH);
    },
    (error) => {
      ToastUtils.error(error as string);
    }
  );

  const markMessageAsUnread = useCallback(
    (message: IBasicMessage) => {
      const conversationId = conversation?.id;
      if (!conversationId) return;
      markAsUnread({ messageId: message.id, conversationId });
    },
    [conversation?.id, markAsUnread]
  );

  return {
    togglePin,
    unSendMessage,
    selectedPinnedMessage,
    markMessageAsUnread,
  };
}
