import { useCallback } from "react";
import { format } from "date-fns";
import { UseMutateFunction } from "@tanstack/react-query";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import { IMessage, MessageAttachmentTypeEnum } from "@/types/chat/types";
import { UploadResult } from "@/hooks/useNativePickerUpload";
import { ApiResponse } from "@/types/common/types";
import { logError } from "@/utils/logger";

export type FileWithCaption = {
  file: File;
  messageText: string;
};

interface IUseSendMessageHandlerParams {
  currentConversationId: number;
  currentUserId: number | null | undefined;
  imageMessage: string;
  setImageMessage: (text: string) => void;
  selectedMessage: IMessage | null;
  setSelectedMessage: (msg: IMessage | null) => void;
  sendMessage: UseMutateFunction<ApiResponse<unknown>, unknown, unknown, unknown>;
  uploadFilesFromWeb: (
    files: File[],
    captions: string[],
    parentMessageId?: number
  ) => Promise<UploadResult[]>;
  handleCloseImagePreview: () => void;
}

export const useSendMessageHandler = ({
  currentConversationId,
  currentUserId,
  imageMessage,
  setImageMessage,
  selectedMessage,
  setSelectedMessage,
  sendMessage,
  uploadFilesFromWeb,
  handleCloseImagePreview,
}: IUseSendMessageHandlerParams) => {
  const { updateConversationMessagesCache, updateConversationsListCache } =
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

          updateConversationMessagesCache(tempMessage);
          updateConversationsListCache(tempMessage);

          const captions = renamedFiles.map((_, index) => (index === 0 ? imageMessage : ""));
          await uploadFilesFromWeb(renamedFiles, captions, parentMessage?.id);

          setSelectedMessage(null);
          setImageMessage("");
          return;
        }

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

  const handleSendFiles = useCallback(
    async (filesWithCaptions: FileWithCaption[]) => {
      if (!filesWithCaptions || filesWithCaptions.length === 0) return;

      try {
        const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "svg"];

        const renamedFilesWithCaptions = filesWithCaptions.map(({ file, messageText }, index) => {
          const timestamp = format(new Date(), "yyyy-MM-dd HH-mm-ss");
          const ext = file.name.split(".").pop() || "";
          const isImage = IMAGE_EXTENSIONS.includes(ext.toLowerCase());

          const newName = isImage
            ? `ChatApp Image ${currentConversationId}${index} ${timestamp}.${ext}`
            : file.name;

          const renamedFile = new File([file], newName, {
            type: file.type,
            lastModified: file.lastModified,
          });

          return { file: renamedFile, messageText };
        });

        renamedFilesWithCaptions.forEach(({ file, messageText }) => {
          const tempMessage: IMessage = {
            senderId: Number(currentUserId),
            senderFirstName: "",
            senderLastName: "",
            messageText: messageText,
            createdAt: new Date().toISOString(),
            conversationId: currentConversationId,
            messageAttachments: [
              {
                fileUrl: URL.createObjectURL(file),
                originalFileName: file.name,
                indexedFileName: "",
                mimeType: file.type,
                type: MessageAttachmentTypeEnum.IMAGE,
              },
            ],
            hasAttachment: true,
          };

          updateConversationMessagesCache(tempMessage);
          updateConversationsListCache(tempMessage);
        });

        const files = renamedFilesWithCaptions.map(({ file }) => file);
        const captions = renamedFilesWithCaptions.map(({ messageText }) => messageText);

        await uploadFilesFromWeb(files, captions, selectedMessage?.id);

        handleCloseImagePreview();
        setImageMessage("");
        setSelectedMessage(null);
      } catch (error) {
        logError("Failed to send files:", error);
      }
    },
    [
      currentConversationId,
      currentUserId,
      selectedMessage,
      uploadFilesFromWeb,
      updateConversationMessagesCache,
      updateConversationsListCache,
      handleCloseImagePreview,
      setImageMessage,
      setSelectedMessage,
    ]
  );

  return { handleSendMessage, handleSendFiles } as const;
};
