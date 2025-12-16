import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ToastUtils } from "@/utils/toastUtils";
import { MAX_FILES, validateFiles } from "@/utils/fileValidation";
import FileList from "./FileList";
import FilePreviewPane from "./FilePreviewPane";
import { ACCEPT_FILE_TYPES } from "@/constants/mediaConstants";
import PreviewFooter from "@/components/conversations/conversation-thread/message-list/file-upload/PreviewFooter.tsx";
import { TAttachmentWithCaption } from "@/hooks/conversation-thread/useConversationMessageSender";

type TFilePreviewOverlayProps = {
  files: File[];
  conversationId: number;
  onClose: () => void;
  onRemoveFile: (index: number) => void;
  onSendFiles: (filesWithCaptions: TAttachmentWithCaption[]) => void;
  onFileSelect: (files: File[]) => void;
  isSending?: boolean;
  isGroupChat?: boolean;
  replyToMessage?: any;
  onCancelReply?: () => void;
};

const FilePreviewOverlay = ({
  files,
  conversationId,
  onClose,
  onRemoveFile,
  onSendFiles,
  onFileSelect,
  isSending = false,
  isGroupChat = false,
  replyToMessage,
  onCancelReply,
}: TFilePreviewOverlayProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [captions, setCaptions] = useState<Record<number, string>>({});
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedIndex >= files.length) {
      setSelectedIndex(Math.max(0, files.length - 1));
    }
  }, [files.length, selectedIndex]);

  const handleCaptionChange = useCallback(
    (text: string) => {
      setCaptions((prev) => ({
        ...prev,
        [selectedIndex]: text,
      }));
    },
    [selectedIndex]
  );

  const currentCaption = captions[selectedIndex] ?? "";

  /** Removes a file and realigns captions to keep them in sync with file order. */
  const removeFileAndReindexCaptions = useCallback(
    (removedFileIndex: number) => {
      onRemoveFile(removedFileIndex);

      setCaptions((previousCaptions) => {
        const reindexedCaptions: Record<number, string> = {};

        Object.keys(previousCaptions).forEach((key) => {
          const currentIndex = Number(key);
          const captionText = previousCaptions[currentIndex];

          // Captions before the removed file stay the same
          if (currentIndex < removedFileIndex) {
            reindexedCaptions[currentIndex] = captionText;
          }

          // Captions after the removed file shift left by one index
          if (currentIndex > removedFileIndex) {
            reindexedCaptions[currentIndex - 1] = captionText;
          }
        });

        return reindexedCaptions;
      });
    },
    [onRemoveFile]
  );

  /** Validates files selected via the hidden file input and forwards valid ones. */
    const handleHiddenFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;

      if (!selectedFiles || selectedFiles.length === 0) {
        return;
      }

      const { errors, validFiles } = validateFiles(selectedFiles, files.length);

      errors.forEach((errorMessage) => ToastUtils.error(errorMessage));

      if (validFiles.length > 0) {
        onFileSelect(validFiles);
      }

      event.target.value = "";
    },
    [files.length, onFileSelect]
  );

  const handleAddMore = useCallback(() => {
    if (files.length >= MAX_FILES) {
      ToastUtils.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    fileInputRef.current?.click();
  }, [files.length]);

  const handleClose = useCallback(() => {
    setCaption("");
    onClose();
  }, [onClose]);

  const handleSend = useCallback(() => {
    const filesWithCaptions: TAttachmentWithCaption[] = files.map((file, index) => ({
      file,
      captionText: captions[index] ?? "",
    }));
    onSendFiles(filesWithCaptions);
  }, [files, captions, onSendFiles]);

  if (files.length === 0) return null;

  return (
    <View style={styles.container} className="bg-background-light dark:bg-background-dark">
      <View style={styles.contentRow}>
        <FileList
          files={files}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onRemoveFile={removeFileAndReindexCaptions}
        />
        <FilePreviewPane
          file={files[selectedIndex]}
          message={currentCaption}
          onMessageChange={handleCaptionChange}
          conversationId={conversationId}
          caption={caption}
          onCaptionChange={setCaption}
          onSendFiles={handleSend}
          isSending={isSending}
          isGroupChat={isGroupChat}
          replyToMessage={replyToMessage}
          onCancelReply={onCancelReply}
        />
      </View>

      <PreviewFooter
        isSending={isSending}
        isAtLimit={files.length >= MAX_FILES}
        hasFiles={files.length > 0}
        onAddMore={handleAddMore}
        onClose={handleClose}
        onSend={handleSend}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_FILE_TYPES}
        multiple
        style={styles.hiddenInput}
        onChange={handleHiddenFileInputChange}
      />
    </View>
  );
};

export default FilePreviewOverlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "visible",
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    overflow: "visible",
  },
  hiddenInput: {
    display: "none",
  },
});
