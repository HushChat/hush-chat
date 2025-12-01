/**
 * useReplyHandler
 *
 * Manages reply-to-message state and cleanup.
 */

import { useCallback } from "react";
import type { IMessage } from "@/types/chat/types";

interface UseReplyHandlerOptions {
  replyToMessage?: IMessage | null;
  onCancelReply?: () => void;
}

interface UseReplyHandlerReturn {
  isReplying: boolean;
  replyToMessage: IMessage | null;
  handleCancelReply: () => void;
  getPlaceholder: (defaultPlaceholder: string) => string;
}

export function useReplyHandler({
  replyToMessage,
  onCancelReply,
}: UseReplyHandlerOptions): UseReplyHandlerReturn {
  const isReplying = !!replyToMessage;

  const handleCancelReply = useCallback(() => {
    onCancelReply?.();
  }, [onCancelReply]);

  const getPlaceholder = useCallback(
    (defaultPlaceholder: string) => {
      return isReplying ? "Reply to message..." : defaultPlaceholder;
    },
    [isReplying]
  );

  return {
    isReplying,
    replyToMessage: replyToMessage ?? null,
    handleCancelReply,
    getPlaceholder,
  };
}
