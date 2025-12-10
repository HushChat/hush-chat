import { useCallback } from "react";
import { format } from "date-fns";
import { UseMutateFunction } from "@tanstack/react-query";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import type { IMessage } from "@/types/chat/types";
import { UploadResult } from "@/hooks/useNativePickerUpload";
import { ApiResponse } from "@/types/common/types";
import { logError } from "@/utils/logger";

interface IUseSendMessageHandlerParams {
  currentConversationId: number;
  currentUserId: number | null | undefined;
  imageMessage: string;
  setImageMessage: (text: string) => void;
  selectedMessage: IMessage | null;
  setSelectedMessage: (msg: IMessage | null) => void;
  selectedFiles: File[];
  sendMessage: UseMutateFunction<ApiResponse<unknown>, unknown, unknown, unknown>;
  uploadFilesFromWeb: (files: File[]) => Promise<UploadResult[]>;
  handleCloseImagePreview: () => void;
}

export const useSendMessageHandler = ({
  currentConversationId,
  currentUserId,
  imageMessage,
  setImageMessage,
  selectedMessage,
  setSelectedMessage,
  selectedFiles,
  sendMessage,
  uploadFilesFromWeb,
  handleCloseImagePreview,
}: IUseSendMessageHandlerParams) => {
  const { updateConversationMessagesCache, updateConversationsListCache, invalidateQuery: refetchConversationMessages } =
    useConversationMessagesQuery(currentConversationId);

  const handleSendMessage = useCallback(
    async (message: string, parentMessage?: IMessage, files?: File[]) => {
      const trimmed = message?.trim() ?? "";
      const filesToSend = files || [];

      if (!trimmed && filesToSend.length === 0) return;

      try {
        const validFiles = filesToSend.filter((f) => f instanceof File);
        const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "svg"];

        if (validFiles.length > 0) {
          const renamedFiles = validFiles.map((file, index) => {
            const timestamp = format(new Date(), "yyyy-MM-dd HH-mm-ss");
            const ext = file.name.split(".").pop() || "";
            const isImage = IMAGE_EXTENSIONS.includes(ext);

            const newName = isImage
              ? `ChatApp Image ${currentConversationId}${index} ${timestamp}.${ext}`
              : file.name;

            return new File([file], newName, {
              type: file.type,
              lastModified: file.lastModified,
            });
          });

          const tempMessage: IMessage = {
            senderId: Number(currentUserId),
            senderFirstName: "",
            senderLastName: "",
            messageText: imageMessage || "",
            createdAt: new Date().toISOString(),
            conversationId: currentConversationId,
            messageAttachments: renamedFiles.map((file) => ({
              fileUrl: URL.createObjectURL(file),
              originalFileName: file.name,
              indexedFileName: "",
              mimeType: file.type,
            })),
            hasAttachment: true,
          };

          // Optimistic updates
          updateConversationMessagesCache(tempMessage);
          updateConversationsListCache(tempMessage);

          // Upload files
          await uploadFilesFromWeb(renamedFiles);

          refetchConversationMessages();
          setSelectedMessage(null);
          setImageMessage("");
          return;
        }

        // Send normal text message
        sendMessage({
          conversationId: currentConversationId,
          message: trimmed,
          parentMessageId: parentMessage?.id,
        });

        setSelectedMessage(null);
      } catch (error) {
        logError("Failed to send message:", error);
      }
    },
    [
      imageMessage,
      currentConversationId,
      currentUserId,
      sendMessage,
      uploadFilesFromWeb,
      updateConversationMessagesCache,
      updateConversationsListCache,
      setSelectedMessage,
      setImageMessage,
    ]
  );

  const handleSendFiles = useCallback(() => {
    if (!selectedFiles.length) return;

    void handleSendMessage(imageMessage, selectedMessage ?? undefined, selectedFiles);

    handleCloseImagePreview();
    setImageMessage("");

    if (selectedMessage) setSelectedMessage(null);
  }, [
    selectedFiles,
    imageMessage,
    selectedMessage,
    handleSendMessage,
    handleCloseImagePreview,
    setImageMessage,
    setSelectedMessage,
  ]);

  return { handleSendMessage, handleSendFiles } as const;
};
