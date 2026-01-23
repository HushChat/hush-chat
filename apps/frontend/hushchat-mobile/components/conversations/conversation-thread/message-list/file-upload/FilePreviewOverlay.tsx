import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ToastUtils } from "@/utils/toastUtils";
import { MAX_FILES, validateFiles } from "@/utils/fileValidation";
import FileList from "./FileList";
import FilePreviewPane from "./FilePreviewPane";
import PreviewFooter from "@/components/conversations/conversation-thread/message-list/file-upload/PreviewFooter.tsx";
import { usePasteHandler } from "@/hooks/usePasteHandler";
import { ACCEPT_DOC_TYPES } from "@/constants/mediaConstants";

export type FileWithCaption = {
  file: File;
  caption: string;
};

type TFilePreviewOverlayProps = {
  files: File[];
  conversationId: number;
  onClose: () => void;
  onRemoveFile: (index: number) => void;
  onSendFiles: (filesWithCaptions: FileWithCaption[]) => void;
  onFileSelect: (files: File[]) => void;
  isSending?: boolean;
  isGroupChat?: boolean;
  replyToMessage?: any;
  onCancelReply?: () => void;
  uploadProgress: number;
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
  uploadProgress,
}: TFilePreviewOverlayProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [captions, setCaptions] = useState<Map<number, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCaptions((prev) => {
      const newCaptions = new Map(prev);
      files.forEach((_, index) => {
        if (!newCaptions.has(index)) {
          newCaptions.set(index, "");
        }
      });
      Array.from(newCaptions.keys()).forEach((key) => {
        if (key >= files.length) {
          newCaptions.delete(key);
        }
      });
      return newCaptions;
    });
  }, [files.length]);

  useEffect(() => {
    if (selectedIndex >= files.length) {
      setSelectedIndex(Math.max(0, files.length - 1));
    }
  }, [files.length, selectedIndex]);

  const handlePasteFilesInPreview = useCallback(
    (newFiles: File[]) => {
      onFileSelect(newFiles);
    },
    [onFileSelect]
  );

  usePasteHandler({
    enabled: true,
    onPasteFiles: handlePasteFilesInPreview,
    inputRef: captionInputRef,
  });

  const handleCaptionChange = useCallback(
    (text: string) => {
      setCaptions((prev) => {
        const newCaptions = new Map(prev);
        newCaptions.set(selectedIndex, text);
        return newCaptions;
      });
    },
    [selectedIndex]
  );

  const getCurrentCaption = useCallback(() => {
    return captions.get(selectedIndex) || "";
  }, [captions, selectedIndex]);

  const onHiddenPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files: chosen } = e.target;
      if (chosen && chosen.length > 0) {
        const { errors, validFiles } = validateFiles(chosen, files.length);
        errors.forEach((err) => ToastUtils.error(err));
        if (validFiles.length > 0) onFileSelect(validFiles);
      }
      e.target.value = "";
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

  const handleRemoveFile = useCallback(
    (index: number) => {
      setCaptions((prev) => {
        const newCaptions = new Map<number, string>();
        prev.forEach((caption, key) => {
          if (key < index) {
            newCaptions.set(key, caption);
          } else if (key > index) {
            newCaptions.set(key - 1, caption);
          }
        });
        return newCaptions;
      });
      onRemoveFile(index);
    },
    [onRemoveFile]
  );

  const handleSend = useCallback(() => {
    const filesWithCaptions: FileWithCaption[] = files.map((file, index) => ({
      file,
      caption: captions.get(index) || "",
    }));
    onSendFiles(filesWithCaptions);
    setCaptions(new Map());
  }, [files, captions, onSendFiles]);

  const handleClose = useCallback(() => {
    setCaptions(new Map());
    onClose();
  }, [onClose]);

  if (files.length === 0) return null;

  return (
    <View style={styles.container} className="bg-background-light dark:bg-background-dark">
      <View style={styles.contentRow}>
        <FileList
          files={files}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onRemoveFile={handleRemoveFile}
        />
        <FilePreviewPane
          file={files[selectedIndex]}
          conversationId={conversationId}
          caption={getCurrentCaption()}
          onCaptionChange={handleCaptionChange}
          onSendFiles={handleSend}
          isSending={isSending}
          isGroupChat={isGroupChat}
          replyToMessage={replyToMessage}
          onCancelReply={onCancelReply}
          inputRef={captionInputRef}
          uploadProgress={uploadProgress}
        />
      </View>

      <PreviewFooter
        isSending={isSending}
        isAtLimit={files.length >= MAX_FILES}
        hasFiles={files.length > 0}
        onAddMore={handleAddMore}
        onClose={handleClose}
        onSend={handleSend}
        fileCount={files.length}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_DOC_TYPES}
        multiple
        style={styles.hiddenInput}
        onChange={onHiddenPickerChange}
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
