import { useCallback } from "react";
import { format } from "date-fns";
import { UseMutateFunction } from "@tanstack/react-query";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import { IMessage, MessageAttachmentTypeEnum } from "@/types/chat/types";
import { UploadResult } from "@/hooks/useNativePickerUpload";
import { ApiResponse } from "@/types/common/types";
import { logError } from "@/utils/logger";

export type TAttachmentWithCaption = {
  file: File;
  captionText: string;
};

interface ConversationMessageSenderOptions {
  conversationId: number;
  currentUserId: number | null | undefined;
  attachmentCaptionDraft: string;
  setAttachmentCaptionDraft: (text: string) => void;
  replyingToMessage: IMessage | null;
  setReplyingToMessage: (msg: IMessage | null) => void;
  sendTextMessageMutation: UseMutateFunction<ApiResponse<unknown>, unknown, unknown, unknown>;
  uploadAttachments: (
    files: File[],
    captions: string[],
    parentMessageId?: number
  ) => Promise<UploadResult[]>;
  closeAttachmentPreview: () => void;
}

const IMAGE_FILE_EXTENSIONS = ["jpg", "jpeg", "png", "svg"];

let temporaryMessageIdSeed = -1;

const generateTemporaryMessageId = (): number => temporaryMessageIdSeed--;

const isImageAttachment = (filename: string): boolean => {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_FILE_EXTENSIONS.includes(extension);
};

const generateUploadTimestamp = (): string => format(new Date(), "yyyy-MM-dd HH-mm-ss");

const renameAttachmentForUpload = (file: File, conversationId: number, index: number): File => {
  const extension = file.name.split(".").pop() ?? "";

  const renamedFilename = isImageAttachment(file.name)
    ? `ChatApp Image ${conversationId}_${index}_${generateUploadTimestamp()}.${extension}`
    : file.name;

  return new File([file], renamedFilename, {
    type: file.type,
    lastModified: file.lastModified,
  });
};

const buildTemporaryMessage = (params: {
  conversationId: number;
  senderId: number;
  messageText: string;
  attachments: File[];
}): IMessage => {
  const { conversationId, senderId, messageText, attachments } = params;

  return {
    id: generateTemporaryMessageId(),
    isForwarded: false,
    senderId,
    senderFirstName: "",
    senderLastName: "",
    messageText,
    createdAt: new Date().toISOString(),
    conversationId,
    messageAttachments: attachments.map((file) => ({
      fileUrl: URL.createObjectURL(file),
      originalFileName: file.name,
      indexedFileName: "",
      mimeType: file.type,
      type: MessageAttachmentTypeEnum.IMAGE,
    })),
    hasAttachment: true,
  };
};

export const useConversationMessageSender = ({
  conversationId,
  currentUserId,
  attachmentCaptionDraft,
  setAttachmentCaptionDraft,
  replyingToMessage,
  setReplyingToMessage,
  sendTextMessageMutation,
  uploadAttachments,
  closeAttachmentPreview,
}: ConversationMessageSenderOptions) => {
  const { updateConversationMessagesCache, updateConversationsListCache } =
    useConversationMessagesQuery(conversationId);

  const commitTemporaryMessageToCache = useCallback(
    (message: IMessage) => {
      updateConversationMessagesCache(message);
      updateConversationsListCache(message);
    },
    [updateConversationMessagesCache, updateConversationsListCache]
  );

  const resetComposerState = useCallback(() => {
    setAttachmentCaptionDraft("");
    setReplyingToMessage(null);
  }, [setAttachmentCaptionDraft, setReplyingToMessage]);

  const sendTextOrAttachmentMessage = useCallback(
    async (rawMessageText: string, parentMessage?: IMessage, attachments?: File[]) => {
      const sanitizedText = rawMessageText?.trim() ?? "";
      const validAttachments = (attachments ?? []).filter((file) => file instanceof File);

      if (!sanitizedText && validAttachments.length === 0) return;

      try {
        if (validAttachments.length > 0) {
          const renamedAttachments = validAttachments.map((file, index) =>
            renameAttachmentForUpload(file, conversationId, index)
          );

          const temporaryMessage = buildTemporaryMessage({
            conversationId,
            senderId: Number(currentUserId),
            messageText: attachmentCaptionDraft,
            attachments: renamedAttachments,
          });

          commitTemporaryMessageToCache(temporaryMessage);

          const captions = renamedAttachments.map((_, index) =>
            index === 0 ? attachmentCaptionDraft : ""
          );

          await uploadAttachments(renamedAttachments, captions, parentMessage?.id);

          resetComposerState();
          return;
        }

        sendTextMessageMutation({
          conversationId,
          message: sanitizedText,
          parentMessageId: parentMessage?.id,
        });

        setReplyingToMessage(null);
      } catch (error) {
        logError("Failed to send message", error);
      }
    },
    [
      attachmentCaptionDraft,
      conversationId,
      currentUserId,
      sendTextMessageMutation,
      uploadAttachments,
      commitTemporaryMessageToCache,
      resetComposerState,
      setReplyingToMessage,
    ]
  );

  const sendAttachmentBatch = useCallback(
    async (attachmentsWithCaptions: TAttachmentWithCaption[]) => {
      if (!attachmentsWithCaptions.length) return;

      try {
        const processedAttachments = attachmentsWithCaptions.map(({ file, captionText }, index) => {
          const renamedFile = renameAttachmentForUpload(file, conversationId, index);

          const temporaryMessage = buildTemporaryMessage({
            conversationId,
            senderId: Number(currentUserId),
            messageText: captionText,
            attachments: [renamedFile],
          });

          commitTemporaryMessageToCache(temporaryMessage);

          return { file: renamedFile, caption: captionText };
        });

        await uploadAttachments(
          processedAttachments.map((item) => item.file),
          processedAttachments.map((item) => item.caption),
          replyingToMessage?.id
        );

        closeAttachmentPreview();
        resetComposerState();
      } catch (error) {
        logError("Failed to send attachment batch", error);
      }
    },
    [
      conversationId,
      currentUserId,
      replyingToMessage?.id,
      uploadAttachments,
      commitTemporaryMessageToCache,
      closeAttachmentPreview,
      resetComposerState,
    ]
  );

  return {
    sendTextOrAttachmentMessage,
    sendAttachmentBatch,
  } as const;
};
