import { useCallback, useState } from "react";
import { useEditMessageMutation } from "@/query/patch/queries";
import { ToastUtils } from "@/utils/toastUtils";
import { IMessage } from "@/types/chat/types";

interface IUseMessageEditOptions {
  userId: number;
  conversationId: number;
}

interface IUseMessageEditReturn {
  editingMessage: IMessage | null;
  isEditingMessage: boolean;
  handleStartEdit: (message: IMessage) => void;
  handleCancelEdit: () => void;
  handleEditMessage: (messageId: number, newText: string) => void;
}

export function useMessageEdit({
  userId,
  conversationId,
}: IUseMessageEditOptions): IUseMessageEditReturn {
  const [editingMessage, setEditingMessage] = useState<IMessage | null>(null);

  const { mutate: editMessage, isPending: isEditingMessage } = useEditMessageMutation(
    { userId, conversationId },
    () => {
      setEditingMessage(null);
      ToastUtils.success("Message edited");
    },
    (error: any) => {
      ToastUtils.error(error?.message ?? "Something went wrong");
    }
  );

  const handleStartEdit = useCallback((message: IMessage) => {
    setEditingMessage(message);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingMessage(null);
  }, []);

  const handleEditMessage = useCallback(
    (messageId: number, newText: string) => {
      const trimmedText = newText.trim();

      if (!trimmedText) {
        ToastUtils.error("Message cannot be empty");
        return;
      }

      editMessage({
        conversationId,
        messageId,
        messageText: trimmedText,
      });
    },
    [conversationId, editMessage]
  );

  return {
    editingMessage,
    isEditingMessage,
    handleStartEdit,
    handleCancelEdit,
    handleEditMessage,
  };
}
