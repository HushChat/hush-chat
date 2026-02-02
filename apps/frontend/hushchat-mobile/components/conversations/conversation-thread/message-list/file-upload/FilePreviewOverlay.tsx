import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ToastUtils } from "@/utils/toastUtils";
import { MAX_FILES, validateFiles } from "@/utils/fileValidation";
import FileList from "./FileList";
import FilePreviewPane from "./FilePreviewPane";
import PreviewFooter from "@/components/conversations/conversation-thread/message-list/file-upload/PreviewFooter.tsx";
import { usePasteHandler } from "@/hooks/usePasteHandler";
import { ACCEPT_DOC_TYPES } from "@/constants/mediaConstants";

export type PreviewFile = {
  id: string;
  file: File;
  caption: string;
  isMarkdownEnabled: boolean;
};

type TFilePreviewOverlayProps = {
  files: File[];
  conversationId: number;
  onClose: () => void;
  onRemoveFile: (index: number) => void;
  onSendFiles: (previewFiles: PreviewFile[]) => void;
  onFileSelect: (files: File[]) => void;
  isSending?: boolean;
  isGroupChat?: boolean;
  replyToMessage?: any;
  onCancelReply?: () => void;
  closeOverlay: () => void;
};

const FilePreviewOverlay = ({
  files: incomingFiles,
  conversationId,
  onClose,
  onRemoveFile,
  onSendFiles,
  onFileSelect,
  isSending = false,
  isGroupChat = false,
  replyToMessage,
  onCancelReply,
  closeOverlay,
}: TFilePreviewOverlayProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (incomingFiles.length === 0) {
      setPreviewFiles([]);
      return;
    }

    setPreviewFiles((prev) => {
      if (incomingFiles.length === prev.length) return prev;

      const existingFiles = new Set(prev.map((p) => p.file));
      const newItems: PreviewFile[] = incomingFiles
        .filter((f) => !existingFiles.has(f))
        .map((file) => ({
          id: Math.random().toString(36).substring(7),
          file,
          caption: "",
          isMarkdownEnabled: false,
        }));

      return [...prev, ...newItems];
    });
  }, [incomingFiles]);

  useEffect(() => {
    if (selectedIndex >= previewFiles.length && previewFiles.length > 0) {
      setSelectedIndex(previewFiles.length - 1);
    }
  }, [previewFiles.length, selectedIndex]);

  const handleMarkdownChange = useCallback(
    (isEnabled: boolean) => {
      setPreviewFiles((prev) =>
        prev.map((item, idx) =>
          idx === selectedIndex ? { ...item, isMarkdownEnabled: isEnabled } : item
        )
      );
    },
    [selectedIndex]
  );

  const handleCaptionChange = useCallback(
    (text: string) => {
      setPreviewFiles((prev) =>
        prev.map((item, idx) => (idx === selectedIndex ? { ...item, caption: text } : item))
      );
    },
    [selectedIndex]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      onRemoveFile(index);
      setPreviewFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [onRemoveFile]
  );

  const handleSend = useCallback(() => {
    onSendFiles(previewFiles);
    setPreviewFiles([]);
    closeOverlay();
  }, [previewFiles, onSendFiles]);

  const handleAddMore = useCallback(() => {
    if (previewFiles.length >= MAX_FILES) {
      ToastUtils.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    fileInputRef.current?.click();
  }, [previewFiles.length]);

  const onHiddenPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files: chosen } = e.target;
      if (chosen && chosen.length > 0) {
        const { errors, validFiles } = validateFiles(chosen, previewFiles.length);
        errors.forEach((err) => ToastUtils.error(err));
        if (validFiles.length > 0) onFileSelect(validFiles);
      }
      e.target.value = "";
    },
    [previewFiles.length, onFileSelect]
  );

  usePasteHandler({
    enabled: true,
    onPasteFiles: (newFiles) => onFileSelect(newFiles),
    inputRef: captionInputRef,
  });

  if (previewFiles.length === 0) return null;

  const currentItem = previewFiles[selectedIndex];

  return (
    <View style={styles.container} className="bg-background-light dark:bg-background-dark">
      <View style={styles.contentRow}>
        <FileList
          files={previewFiles.map((p) => p.file)}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onRemoveFile={handleRemoveFile}
        />
        {currentItem && (
          <FilePreviewPane
            file={currentItem.file}
            conversationId={conversationId}
            caption={currentItem.caption}
            onCaptionChange={handleCaptionChange}
            onSendFiles={handleSend}
            isSending={isSending}
            isGroupChat={isGroupChat}
            replyToMessage={replyToMessage}
            onCancelReply={onCancelReply}
            inputRef={captionInputRef}
            isMarkdownEnabled={currentItem.isMarkdownEnabled}
            onMarkdownChange={handleMarkdownChange}
          />
        )}
      </View>

      <PreviewFooter
        isSending={isSending}
        isAtLimit={previewFiles.length >= MAX_FILES}
        hasFiles={previewFiles.length > 0}
        onAddMore={handleAddMore}
        onClose={onClose}
        onSend={handleSend}
        fileCount={previewFiles.length}
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
  container: { flex: 1, overflow: "visible" },
  contentRow: { flex: 1, flexDirection: "row", overflow: "visible" },
  hiddenInput: { display: "none" },
});
