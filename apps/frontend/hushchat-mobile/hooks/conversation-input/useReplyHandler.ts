import { useCallback } from "react";
import type { IMessage } from "@/types/chat/types";

type TReplyHandlerOptions = {
  replyToMessage?: IMessage | null;
  onCancelReply?: () => void;
};

interface IReplyHandlerReturn {
  isReplyModeActive: boolean;
  activeReplyTargetMessage: IMessage | null;
  cancelReplyMode: () => void;
  generateReplyAwarePlaceholder: (defaultPlaceholderText: string) => string;
}

export function useReplyHandler({
  replyToMessage,
  onCancelReply,
}: TReplyHandlerOptions): IReplyHandlerReturn {
  const isReplyModeActive = replyToMessage != null;

  const cancelReplyMode = useCallback(() => {
    onCancelReply?.();
  }, [onCancelReply]);

  const generateReplyAwarePlaceholder = useCallback(
    (defaultPlaceholderText: string) => {
      return isReplyModeActive ? "Replying to a message..." : defaultPlaceholderText;
    },
    [isReplyModeActive]
  );

  return {
    isReplyModeActive,
    activeReplyTargetMessage: replyToMessage ?? null,
    cancelReplyMode,
    generateReplyAwarePlaceholder,
  };
}
