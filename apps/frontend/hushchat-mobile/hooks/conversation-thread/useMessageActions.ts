import { useCallback, useState } from "react";
import { usePinMessageMutation } from "@/query/post/queries";
import { usePatchUnsendMessageMutation } from "@/query/patch/queries";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { useUpdateCache } from "@/query/config/useUpdateCache";
import { ToastUtils } from "@/utils/toastUtils";
import { PaginatedResponse } from "@/types/common/types";
import { conversationQueryKeys, conversationMessageQueryKeys } from "@/constants/queryKeys";
import type { IBasicMessage, IMessage, ConversationAPIResponse } from "@/types/chat/types";

export function useMessageActions(
  conversation: ConversationAPIResponse | undefined,
  currentUserId: number | null | undefined
) {
  const updateCache = useUpdateCache();

  const [selectedPinnedMessage, setSelectedPinnedMessage] = useState<IBasicMessage | null>(null);
  const [unsendMessageState, setUnsendMessageState] = useState<IBasicMessage | null>(null);

  const { refetch: refetchConversationList } = useConversationsQuery();

  /**
   * PIN / UNPIN MESSAGE
   */
  const { mutate: togglePinMessage } = usePinMessageMutation(
    undefined,
    () => {
      const newPinnedState =
        conversation?.pinnedMessage?.id === selectedPinnedMessage?.id
          ? null
          : selectedPinnedMessage;

      updateCache(
        conversationQueryKeys.metaDataById(
          Number(currentUserId ?? 0),
          Number(conversation?.id ?? 0)
        ),
        (prev) => (prev ? { ...prev, pinnedMessage: newPinnedState } : prev)
      );
    },
    (error) => {
      ToastUtils.error(error as string);
    }
  );

  const togglePin = useCallback(
    (message?: IBasicMessage) => {
      const conversationId = conversation?.id;
      if (!conversationId || !message) return;

      setSelectedPinnedMessage(message);
      togglePinMessage({ conversationId, messageId: message.id });
    },
    [conversation?.id, togglePinMessage]
  );

  /**
   * UNSEND MESSAGE
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

  return {
    togglePin,
    unSendMessage,
    selectedPinnedMessage,
  };
}
