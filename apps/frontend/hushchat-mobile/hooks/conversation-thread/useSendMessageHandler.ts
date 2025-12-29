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
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { MessagesRepo } from "@/db/messages-repo";

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
}

let tempMessageIdCounter = -1;
export const generateTempMessageId = (): number => tempMessageIdCounter--;

const createTempImageMessage = ({
  file,
  messageText,
  conversationId,
  senderId,
  status,
}: {
  file: File;
  messageText: string;
  conversationId: number;
  senderId: number;
  status: "pending" | "sent" | "failed";
}): IMessage => ({
  id: generateTempMessageId(),
  status,
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
}: IUseSendMessageHandlerParams) => {
  const isOnline = useNetworkStatus();
  const { updateConversationMessagesCache, updateConversationsListCache } =
    useConversationMessagesQuery(currentConversationId);

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
                status: isOnline ? "sent" : "pending",
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
              status: isOnline ? "sent" : "pending",
            })
          );

          if (!isOnline) {
            ToastUtils.error("Files will be sent when online (Not implemented yet)");
            // TODO: Handle offline file uploads
            setSelectedMessage(null);
            return;
          }

          const filesWithCaptions: TFileWithCaption[] = renamedFiles.map((file) => ({
            file,
            caption: trimmed,
          }));

          await uploadFilesFromWebWithCaptions(filesWithCaptions, parentMessage?.id ?? null);

          setSelectedMessage(null);
          return;
        }

        if (!isOnline) {
          const tempId = generateTempMessageId();
          const tempMessage: IMessage = {
            id: tempId,
            senderId: Number(currentUserId),
            senderFirstName: "",
            senderLastName: "",
            messageText: trimmed,
            createdAt: new Date().toISOString(),
            conversationId: currentConversationId,
            status: "pending",
            hasAttachment: false,
            parentMessageId: parentMessage?.id,
            isForwarded: false,
          };

          updateConversationMessagesCache(tempMessage);

          await MessagesRepo.savePendingMessage({
            id: String(tempId),
            conversation_id: currentConversationId,
            message_text: trimmed,
            created_at: tempMessage.createdAt,
            status: "pending",
            parent_message_id: parentMessage?.id,
          });

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
              status: isOnline ? "sent" : "pending",
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
            status: isOnline ? "sent" : "pending",
          })
        );

        if (!isOnline) {
          ToastUtils.error("Files will be sent when online.");
          // TODO: Offline file support
          handleCloseImagePreview();
          setSelectedMessage(null);
          return;
        }

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
