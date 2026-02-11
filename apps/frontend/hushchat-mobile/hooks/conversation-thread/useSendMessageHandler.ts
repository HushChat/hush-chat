import { useCallback } from "react";
import { format } from "date-fns";
import { UseMutateFunction } from "@tanstack/react-query";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import { IMessage, MessageAttachmentTypeEnum } from "@/types/chat/types";
import { LocalFile, UploadResult } from "@/hooks/useNativePickerUpload";
import { ApiResponse } from "@/types/common/types";
import { logError } from "@/utils/logger";
import { getFileType } from "@/utils/files/getFileType";
import { ToastUtils } from "@/utils/toastUtils";

export type TFileWithCaption = {
  file: File;
  caption: string;
  isMarkdownEnabled: boolean;
};

interface IUseSendMessageHandlerParams {
  currentConversationId: number;
  currentUserId: number | null | undefined;
  selectedMessage: IMessage | null;
  setSelectedMessage: (msg: IMessage | null) => void;
  sendMessage: UseMutateFunction<ApiResponse<unknown>, unknown, unknown, unknown>;
  uploadFilesFromWebWithCaptions: (
    filesWithCaptions: TFileWithCaption[],
    parentMessageId?: number | null,
    onUploadStart?: (pairs: { message: IMessage; file: LocalFile }[]) => void
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
    async (
      message: string,
      isMarkdownEnabled: boolean,
      parentMessage?: IMessage,
      files?: File[],
      gifUrl?: string
    ) => {
      const trimmed = message?.trim() ?? "";
      const filesToSend = files || [];

      if (!trimmed && filesToSend.length === 0 && !gifUrl) return;

      try {
        const validFiles = filesToSend.filter((f) => f instanceof File);

        if (validFiles.length > 0) {
          const renamedFiles = validFiles.map((file, index) => renameFile(file, index));

          const lastFile = renamedFiles[renamedFiles.length - 1];

          const filesWithCaptions: TFileWithCaption[] = renamedFiles.map((file) => ({
            file,
            caption: trimmed,
            isMarkdownEnabled,
          }));

          const parentMsgId = parentMessage?.id ?? null;

          const results = await uploadFilesFromWebWithCaptions(filesWithCaptions, parentMsgId);

          results.forEach((result) => {
            if (result.success && result.messageId) {
              const newMessage = result.newMessage ?? ({} as IMessage);
              const file = lastFile;

              const messageAttachments = [
                {
                  fileUrl: URL.createObjectURL(file),
                  originalFileName: file.name,
                  indexedFileName: "",
                  mimeType: file.type,
                  type: MessageAttachmentTypeEnum.MEDIA,
                  updatedAt: "",
                },
              ];

              const updatingCacheMessage = {
                ...newMessage,
                messageAttachments,
              };

              updateConversationMessagesCache(updatingCacheMessage ?? ({} as IMessage));
              updateConversationsListCache(result?.newMessage ?? ({} as IMessage));
            }
          });

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
          isMarkdownEnabled: isMarkdownEnabled,
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

      try {
        const preparedFiles: TFileWithCaption[] = filesWithCaptions.map(
          ({ file, caption, isMarkdownEnabled }, index) => ({
            file: renameFile(file, index),
            caption: caption.trim(),
            isMarkdownEnabled,
          })
        );

        const onUploadStart = (pairs: { message: IMessage; file: LocalFile }[]) => {
          pairs.forEach(({ message, file }) => {
            const messageAttachments = [
              {
                fileUrl: file.uri,
                originalFileName: file.name,
                indexedFileName: "",
                mimeType: file.type,
                type: MessageAttachmentTypeEnum.MEDIA,
                updatedAt: new Date().toISOString(),
              },
            ];

            const updatingCacheMessage = {
              ...message,
              messageAttachments,
            };

            updateConversationMessagesCache(updatingCacheMessage);
            updateConversationsListCache(updatingCacheMessage);
          });
        };

        const results = await uploadFilesFromWebWithCaptions(
          preparedFiles,
          parentMsgId,
          onUploadStart
        );

        const failedCount = results.filter((r) => !r.success).length;
        if (failedCount > 0) {
          logError(`${failedCount} file(s) failed to upload`);
        }

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
