import { useCallback } from "react";
import { format } from "date-fns";

import type { IMessage } from "@/types/chat/types";
import type { UseMutateFunction } from "@tanstack/react-query";

interface UseSendMessageHandlerParams {
  selectedConversationId: number;
  currentUserId: number | null | undefined;
  imageMessage: string;
  setImageMessage: (text: string) => void;
  selectedMessage: IMessage | null;
  setSelectedMessage: (msg: IMessage | null) => void;
  // Files selected from preview
  selectedFiles: File[];
  // Mutation to send normal text messages
  sendMessage: UseMutateFunction<any, any, any, unknown>;
  // Web file upload
  uploadFilesFromWeb: (files: File[]) => Promise<any>;
  // Cache updater
  updateConversationMessagesCache: (msg: IMessage) => void;
  // Preview actions
  handleCloseImagePreview: () => void;
}

export const useSendMessageHandler = ({
  selectedConversationId,
  currentUserId,
  imageMessage,
  setImageMessage,
  selectedMessage,
  setSelectedMessage,
  selectedFiles,
  sendMessage,
  uploadFilesFromWeb,
  updateConversationMessagesCache,
  handleCloseImagePreview,
}: UseSendMessageHandlerParams) => {
  /**
   * Core send message logic
   */
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
              ? `ChatApp Image ${selectedConversationId}${index} ${timestamp}.${ext}`
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
            conversationId: selectedConversationId,
            messageAttachments: renamedFiles.map((file) => ({
              fileUrl: URL.createObjectURL(file),
              originalFileName: file.name,
              indexedFileName: "",
              mimeType: file.type,
            })),
          };

          // Local optimistic update
          updateConversationMessagesCache(tempMessage);

          // Upload actual files
          await uploadFilesFromWeb(renamedFiles);

          setSelectedMessage(null);
          setImageMessage("");
          return;
        }

        sendMessage({
          conversationId: selectedConversationId,
          message: trimmed,
          parentMessageId: parentMessage?.id,
        });

        setSelectedMessage(null);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [
      imageMessage,
      selectedConversationId,
      currentUserId,
      sendMessage,
      uploadFilesFromWeb,
      updateConversationMessagesCache,
      setSelectedMessage,
      setImageMessage,
    ]
  );

  /**
   * Send button in Preview Overlay
   */
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

  return {
    handleSendMessage,
    handleSendFiles,
  };
};
