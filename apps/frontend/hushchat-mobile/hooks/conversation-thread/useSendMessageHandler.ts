import { useCallback } from "react";
import { format } from "date-fns";
import { UseMutateFunction } from "@tanstack/react-query";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import { IMessage, MessageAttachmentTypeEnum } from "@/types/chat/types";
import { UploadResult } from "@/hooks/useNativePickerUpload";
import { ApiResponse } from "@/types/common/types";
import { logError } from "@/utils/logger";
import { FileWithCaption } from "@/components/conversations/conversation-thread/message-list/file-upload/FilePreviewOverlay";

interface IUseSendMessageHandlerParams {
  currentConversationId: number;
  currentUserId: number | null | undefined;
  selectedMessage: IMessage | null;
  setSelectedMessage: (msg: IMessage | null) => void;
  sendMessage: UseMutateFunction<ApiResponse<unknown>, unknown, unknown>;
  uploadFilesFromWebWithCaptions: (
    filesWithCaptions: FileWithCaption[],
    parentMessageId?: number | null
  ) => Promise<UploadResult[]>;
  handleCloseImagePreview: () => void;
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "svg", "gif", "webp"];
let tempMessageIdCounter = -1;

const generateTempMessageId = (): number => tempMessageIdCounter--;

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
      if (!IMAGE_EXTENSIONS.includes(ext)) return file;

      const timestamp = format(new Date(), "yyyy-MM-dd HH-mm-ss");
      const newName = `ChatApp Image ${currentConversationId}${index} ${timestamp}.${ext}`;
      return new File([file], newName, { type: file.type, lastModified: file.lastModified });
    },
    [currentConversationId]
  );

  const createTempMessage = useCallback(
    (file: File, caption: string): IMessage => ({
      id: generateTempMessageId(),
      isForwarded: false,
      senderId: Number(currentUserId),
      senderFirstName: "",
      senderLastName: "",
      messageText: caption,
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
    }),
    [currentConversationId, currentUserId]
  );

  const handleSendMessage = useCallback(
    async (message: string, parentMessage?: IMessage, files?: File[]) => {
      const trimmed = message?.trim() ?? "";
      const validFiles = (files || []).filter((f) => f instanceof File);

      if (!trimmed && !validFiles.length) return;

      try {
        if (validFiles.length > 0) {
          const renamedFiles = validFiles.map((file, i) => renameFile(file, i));

          renamedFiles.forEach((file) =>
            updateConversationMessagesCache(createTempMessage(file, trimmed))
          );
          updateConversationsListCache(
            createTempMessage(
              renamedFiles.at(-1)!,
              trimmed || `Sent ${renamedFiles.length} file(s)`
            )
          );
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
      sendMessage,
      updateConversationMessagesCache,
      updateConversationsListCache,
      setSelectedMessage,
      renameFile,
      createTempMessage,
    ]
  );

  const handleSendFilesWithCaptions = useCallback(
    async (filesWithCaptions: FileWithCaption[]) => {
      if (!filesWithCaptions?.length) return;

      try {
        const preparedFiles = filesWithCaptions.map(({ file, caption }, i) => ({
          file: renameFile(file, i),
          caption: caption.trim(),
        }));

        preparedFiles.forEach(({ file, caption }) =>
          updateConversationMessagesCache(createTempMessage(file, caption))
        );
        const lastItem = preparedFiles.at(-1)!;
        updateConversationsListCache(
          createTempMessage(
            lastItem.file,
            lastItem.caption || `Sent ${preparedFiles.length} file(s)`
          )
        );

        const results = await uploadFilesFromWebWithCaptions(
          preparedFiles,
          selectedMessage?.id ?? null
        );
        const failedCount = results.filter((r) => !r.success).length;

        if (failedCount > 0) logError(`${failedCount} file(s) failed to upload`);
        if (results.some((r) => r.success)) {
          handleCloseImagePreview();
          setSelectedMessage(null);
        }
      } catch (error) {
        logError("Failed to send files:", error);
      }
    },
    [
      currentConversationId,
      selectedMessage,
      uploadFilesFromWebWithCaptions,
      updateConversationMessagesCache,
      updateConversationsListCache,
      handleCloseImagePreview,
      setSelectedMessage,
      renameFile,
      createTempMessage,
    ]
  );

  return { handleSendMessage, handleSendFilesWithCaptions } as const;
};
