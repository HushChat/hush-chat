import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ToastUtils } from "@/utils/toastUtils";
import { MAX_FILES, validateFiles } from "@/utils/fileValidation";
import FileList from "./FileList";
import FilePreviewPane from "./FilePreviewPane";
import PreviewFooter from "@/components/conversations/conversation-thread/message-list/file-upload/PreviewFooter.tsx";
import { usePasteHandler } from "@/hooks/usePasteHandler";
import { ACCEPT_DOC_TYPES } from "@/constants/mediaConstants";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import ImageEditorWeb from "@/components/image-editor/ImageEditorWeb";
import { getFileType } from "@/utils/files/getFileType";

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
  const isMobile = useIsMobileLayout();
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

  const [editorVisible, setEditorVisible] = useState(false);
  const [editorImageUri, setEditorImageUri] = useState("");

  const handleEditImage = useCallback(() => {
    const current = previewFiles[selectedIndex];
    if (!current || getFileType(current.file.name) !== "image") return;
    const uri = URL.createObjectURL(current.file);
    setEditorImageUri(uri);
    setEditorVisible(true);
  }, [previewFiles, selectedIndex]);

  const handleEditorSave = useCallback(
    (editedFile: File) => {
      setPreviewFiles((prev) =>
        prev.map((item, idx) => (idx === selectedIndex ? { ...item, file: editedFile } : item))
      );
      setEditorVisible(false);
      URL.revokeObjectURL(editorImageUri);
      setEditorImageUri("");
    },
    [selectedIndex, editorImageUri]
  );

  const handleEditorCancel = useCallback(() => {
    setEditorVisible(false);
    URL.revokeObjectURL(editorImageUri);
    setEditorImageUri("");
  }, [editorImageUri]);

  usePasteHandler({
    enabled: true,
    onPasteFiles: (newFiles) => onFileSelect(newFiles),
    inputRef: captionInputRef,
  });

  if (previewFiles.length === 0) return null;

  const currentItem = previewFiles[selectedIndex];
  const currentFileIsImage = currentItem && getFileType(currentItem.file.name) === "image";

  return (
    <View style={styles.container} className="bg-background-light dark:bg-background-dark">
      <View style={isMobile ? styles.contentColumn : styles.contentRow}>
        <FileList
          files={previewFiles.map((p) => p.file)}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onRemoveFile={handleRemoveFile}
          horizontal={isMobile}
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
            onEditImage={currentFileIsImage ? handleEditImage : undefined}
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
      <ImageEditorWeb
        visible={editorVisible}
        imageUri={editorImageUri}
        onSave={handleEditorSave}
        onCancel={handleEditorCancel}
      />
    </View>
  );
};

export default FilePreviewOverlay;

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "visible" },
  contentRow: { flex: 1, flexDirection: "row", overflow: "visible" },
  contentColumn: { flex: 1, flexDirection: "column", overflow: "visible" },
  hiddenInput: { display: "none" },
});
