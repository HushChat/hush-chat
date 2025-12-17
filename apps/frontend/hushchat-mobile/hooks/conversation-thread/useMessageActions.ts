import { useCallback, useState } from "react";
import { usePinMessageMutation } from "@/query/post/queries";
import { usePatchUnsendMessageMutation } from "@/query/patch/queries";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { useUpdateCache } from "@/query/config/useUpdateCache";
import { ToastUtils } from "@/utils/toastUtils";
import { PaginatedResponse } from "@/types/common/types";
import { conversationQueryKeys, conversationMessageQueryKeys } from "@/constants/queryKeys";
import type { IBasicMessage, IMessage, ConversationAPIResponse } from "@/types/chat/types";
import * as Clipboard from "expo-clipboard";
import { logError } from "@/utils/logger";
import { BuildConstantKeys, getBuildConstant } from "@/constants/build-constants";

export function useMessageActions(
  conversation: ConversationAPIResponse | undefined,
  currentUserId: number | null | undefined
) {
  const updateCache = useUpdateCache();

  const [selectedPinnedMessage, setSelectedPinnedMessage] = useState<IBasicMessage | null>(null);
  const [unsendMessageState, setUnsendMessageState] = useState<IBasicMessage | null>(null);

  const { refetch: refetchConversationList } = useConversationsQuery();
  const baseURL = getBuildConstant(BuildConstantKeys.WEB_DOMAIN);

  /**
   * Pin/Unpin Messages
   */
  const { mutate: togglePinMessage } = usePinMessageMutation(
    {
      userId: Number(currentUserId),
      conversationId: Number(conversation?.id),
    },
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

  const copyMessageUrl = useCallback(
    async (message: IBasicMessage) => {
      const conversationId = conversation?.id;
      if (!conversationId) return;

      const url = `${baseURL}/conversations/${conversationId}?messageId=${message.id}`;

      try {
        await Clipboard.setStringAsync(url);
        ToastUtils.success("Message link copied to clipboard");
      } catch (error) {
        ToastUtils.error("Failed to copy link");
        logError("Failed to copy link", error);
      }
    },
    [conversation?.id]
  );

  return {
    togglePin,
    unSendMessage,
    selectedPinnedMessage,
    copyMessageUrl,
  };
}
