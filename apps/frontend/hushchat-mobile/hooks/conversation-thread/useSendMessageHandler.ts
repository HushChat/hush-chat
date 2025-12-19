import { useCallback } from "react";
import { format } from "date-fns";
import { UseMutateFunction } from "@tanstack/react-query";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import { IMessage, MessageAttachmentTypeEnum } from "@/types/chat/types";
import { UploadResult } from "@/hooks/useNativePickerUpload";
import { ApiResponse } from "@/types/common/types";
import { logError } from "@/utils/logger";

export type TFileWithCaption = {
  file: File;
  caption: string;
};

interface IUseSendMessageHandlerParams {
  currentConversationId: number;
  currentUserId: number | null | undefined;
  selectedMessage: IMessage | null;
  setSelectedMessage: (msg: IMessage | null) => void;
  sendMessage: UseMutateFunction<ApiResponse<unknown>, unknown, unknown, unknown>;
  uploadFilesFromWebWithCaptions: (
    filesWithCaptions: TFileWithCaption[],
    parentMessageId?: number | null
  ) => Promise<UploadResult[]>;
  handleCloseImagePreview: () => void;
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "svg", "gif", "webp"];

let tempMessageIdCounter = -1;
export const generateTempMessageId = (): number => tempMessageIdCounter--;

const createTempImageMessage = ({
  file,
  messageText,
  conversationId,
  senderId,
}: {
  file: File;
  messageText: string;
  conversationId: number;
  senderId: number;
}): IMessage => ({
  id: generateTempMessageId(),
  isForwarded: false,
  senderId,
  senderFirstName: "",
  senderLastName: "",
  messageText,
  createdAt: new Date().toISOString(),
  conversationId,
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
});

export const useSendMessageHandler = ({
  currentConversationId,
  currentUserId,
  selectedMessage,
  setSelectedMessage,
  sendMessage,
  uploadFilesFromWebWithCaptions,
  handleCloseImagePreview,
}: IUseSendMessageHandlerParams) => {
  const { updateConversationMessagesCache, updateConversationsListCache } =
    useConversationMessagesQuery(currentConversationId);

  const renameFile = useCallback(
    (file: File, index: number): File => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isImage = IMAGE_EXTENSIONS.includes(ext);

      if (!isImage) return file;

      const timestamp = format(new Date(), "yyyy-MM-dd HH-mm-ss");
      const newName = `ChatApp Image ${currentConversationId}${index} ${timestamp}.${ext}`;

      return new File([file], newName, {
        type: file.type,
        lastModified: file.lastModified,
      });
    },
    [currentConversationId]
  );

  const handleSendMessage = useCallback(
    async (message: string, parentMessage?: IMessage, files?: File[]) => {
      const trimmed = message?.trim() ?? "";
      const filesToSend = files || [];

      if (!trimmed && filesToSend.length === 0) return;

      try {
        const validFiles = filesToSend.filter((f) => f instanceof File);

        if (validFiles.length > 0) {
          const renamedFiles = validFiles.map((file, index) => renameFile(file, index));

          renamedFiles.forEach((file) => {
            updateConversationMessagesCache(
              createTempImageMessage({
                file,
                messageText: trimmed,
                conversationId: currentConversationId,
                senderId: Number(currentUserId),
              })
            );
          });

          const lastFile = renamedFiles[renamedFiles.length - 1];
          updateConversationsListCache(
            createTempImageMessage({
              file: lastFile,
              messageText: trimmed || `Sent ${renamedFiles.length} file(s)`,
              conversationId: currentConversationId,
              senderId: Number(currentUserId),
            })
          );

          const filesWithCaptions: TFileWithCaption[] = renamedFiles.map((file) => ({
            file,
            caption: trimmed,
          }));

          await uploadFilesFromWebWithCaptions(filesWithCaptions, parentMessage?.id ?? null);

          setSelectedMessage(null);
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
      currentConversationId,
      currentUserId,
      sendMessage,
      uploadFilesFromWebWithCaptions,
      updateConversationMessagesCache,
      updateConversationsListCache,
      setSelectedMessage,
      renameFile,
    ]
  );

  const handleSendFilesWithCaptions = useCallback(
    async (filesWithCaptions: TFileWithCaption[]) => {
      if (!filesWithCaptions || filesWithCaptions.length === 0) return;

      try {
        const preparedFiles: TFileWithCaption[] = filesWithCaptions.map(
          ({ file, caption }, index) => ({
            file: renameFile(file, index),
            caption: caption.trim(),
          })
        );

        preparedFiles.forEach(({ file, caption }) => {
          updateConversationMessagesCache(
            createTempImageMessage({
              file,
              messageText: caption,
              conversationId: currentConversationId,
              senderId: Number(currentUserId),
            })
          );
        });

        const lastItem = preparedFiles[preparedFiles.length - 1];
        updateConversationsListCache(
          createTempImageMessage({
            file: lastItem.file,
            messageText: lastItem.caption || `Sent ${preparedFiles.length} file(s)`,
            conversationId: currentConversationId,
            senderId: Number(currentUserId),
          })
        );

        const results = await uploadFilesFromWebWithCaptions(
          preparedFiles,
          selectedMessage?.id ?? null
        );

        const failedCount = results.filter((r) => !r.success).length;
        if (failedCount > 0) {
          logError(`${failedCount} file(s) failed to upload`);
        }

        handleCloseImagePreview();
        setSelectedMessage(null);
      } catch (error) {
        logError("Failed to send files:", error);
      }
    },
    [
      currentConversationId,
      currentUserId,
      selectedMessage,
      uploadFilesFromWebWithCaptions,
      updateConversationMessagesCache,
      updateConversationsListCache,
      handleCloseImagePreview,
      setSelectedMessage,
      renameFile,
    ]
  );

  return {
    handleSendMessage,
    handleSendFilesWithCaptions,
  } as const;
};
