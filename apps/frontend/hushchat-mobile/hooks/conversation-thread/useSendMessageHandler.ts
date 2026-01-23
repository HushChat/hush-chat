import { useCallback } from "react";
import { format } from "date-fns";
import { UseMutateFunction } from "@tanstack/react-query";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import { IMessage, MessageAttachmentTypeEnum } from "@/types/chat/types";
import { UploadResult } from "@/hooks/useNativePickerUpload";
import { ApiResponse } from "@/types/common/types";
import { logError } from "@/utils/logger";
import { getFileType } from "@/utils/files/getFileType";
import { ToastUtils } from "@/utils/toastUtils";

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
  updateConversationMessagesCache: (message: IMessage) => void;
  sendGifMessage: (
    gifUrl: string,
    messageText: string,
    parentMessageId?: number | null
  ) => Promise<IMessage[]>;
}

let tempMessageIdCounter = -1;
export const generateTempMessageId = (): number => tempMessageIdCounter--;

const createTempImageMessage = ({
  file,
  messageText,
  conversationId,
  senderId,
  tempId,
}: {
  file: File;
  messageText: string;
  conversationId: number;
  senderId: number;
  tempId: number;
}): IMessage => ({
  id: tempId,
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
      type: MessageAttachmentTypeEnum.MEDIA,
      updatedAt: "",
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
  sendGifMessage,
}: IUseSendMessageHandlerParams) => {
  const { updateConversationMessagesCache, updateConversationsListCache, replaceTempMessage } =
    useConversationMessagesQuery(currentConversationId, { enabled: false });

  const renameFile = useCallback(
    (file: File, index: number): File => {
      const timestamp = format(new Date(), "yyyy-MM-dd HH-mm-ss");
      const ext = file.name.split(".").pop() || "";
      const fileType = getFileType(file.name);

      if (fileType === "unsupported") {
        ToastUtils.error("Unsupported file type");
        throw new Error("Unsupported file type");
      }

      let newName: string;

      switch (fileType) {
        case "image":
          newName = `HushChat Image ${currentConversationId}-${index} ${timestamp}.${ext}`;
          break;
        case "video":
          newName = `HushChat Video ${currentConversationId}-${index} ${timestamp}.${ext}`;
          break;
        case "document":
          newName = file.name;
          break;
      }

      return new File([file], newName, {
        type: file.type,
        lastModified: file.lastModified,
      });
    },
    [currentConversationId]
  );

  const handleSendMessage = useCallback(
    async (message: string, parentMessage?: IMessage, files?: File[], gifUrl?: string) => {
      const trimmed = message?.trim() ?? "";
      const filesToSend = files || [];

      if (!trimmed && filesToSend.length === 0 && !gifUrl) return;

      try {
        const validFiles = filesToSend.filter((f) => f instanceof File);

        if (validFiles.length > 0) {
          const renamedFiles = validFiles.map((file, index) => renameFile(file, index));

          const tempMessageIds: number[] = [];

          renamedFiles.forEach((file) => {
            const tempId = generateTempMessageId();
            tempMessageIds.push(tempId);

            const tempMsg = createTempImageMessage({
              file,
              messageText: trimmed,
              conversationId: currentConversationId,
              senderId: Number(currentUserId),
              tempId,
            });

            updateConversationMessagesCache(tempMsg);
          });

          const lastFile = renamedFiles[renamedFiles.length - 1];
          updateConversationsListCache(
            createTempImageMessage({
              file: lastFile,
              messageText: trimmed || `Sent ${renamedFiles.length} file(s)`,
              conversationId: currentConversationId,
              senderId: Number(currentUserId),
              tempId: generateTempMessageId(),
            })
          );

          const filesWithCaptions: TFileWithCaption[] = renamedFiles.map((file) => ({
            file,
            caption: trimmed,
          }));

          const parentMsgId = parentMessage?.id ?? null;

          const results = await uploadFilesFromWebWithCaptions(filesWithCaptions, parentMsgId);

          if (replaceTempMessage) {
            results.forEach((result, index) => {
              if (result.success && result.messageId && index < tempMessageIds.length) {
                const tempId = tempMessageIds[index];
                replaceTempMessage(tempId, result.messageId);
              }
            });
          }

          setSelectedMessage(null);
          return;
        }

        if (gifUrl) {
          const response = await sendGifMessage(gifUrl, trimmed, parentMessage?.id);
          if (response && response.length > 0) {
            const newMessage = response[0];

            updateConversationMessagesCache(newMessage);
            updateConversationsListCache(newMessage);
          }

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
      replaceTempMessage,
    ]
  );

  const handleSendFilesWithCaptions = useCallback(
    async (filesWithCaptions: TFileWithCaption[]) => {
      if (!filesWithCaptions || filesWithCaptions.length === 0) return;

      const parentMsgId = selectedMessage?.id ?? null;
      const tempMessageIds: number[] = [];

      try {
        const preparedFiles: TFileWithCaption[] = filesWithCaptions.map(
          ({ file, caption }, index) => ({
            file: renameFile(file, index),
            caption: caption.trim(),
          })
        );

        preparedFiles.forEach(({ file, caption }) => {
          const tempId = generateTempMessageId();
          tempMessageIds.push(tempId);

          const tempMsg = createTempImageMessage({
            file,
            messageText: caption,
            conversationId: currentConversationId,
            senderId: Number(currentUserId),
            tempId,
          });

          updateConversationMessagesCache(tempMsg);
        });

        const lastItem = preparedFiles[preparedFiles.length - 1];
        updateConversationsListCache(
          createTempImageMessage({
            file: lastItem.file,
            messageText: lastItem.caption || `Sent ${preparedFiles.length} file(s)`,
            conversationId: currentConversationId,
            senderId: Number(currentUserId),
            tempId: generateTempMessageId(),
          })
        );

        const results = await uploadFilesFromWebWithCaptions(preparedFiles, parentMsgId);

        if (replaceTempMessage) {
          results.forEach((result, index) => {
            if (result.success && result.messageId && index < tempMessageIds.length) {
              const tempId = tempMessageIds[index];
              replaceTempMessage(tempId, result.messageId);
            }
          });
        }

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
      replaceTempMessage,
    ]
  );

  return {
    handleSendMessage,
    handleSendFilesWithCaptions,
  } as const;
};
