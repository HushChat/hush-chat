import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ToastUtils } from "@/utils/toastUtils";
import { MAX_FILES, validateFiles } from "@/utils/fileValidation";
import FileList from "./FileList";
import FilePreviewPane from "./FilePreviewPane";
import { ACCEPT_FILE_TYPES } from "@/constants/mediaConstants";
import PreviewFooter from "@/components/conversations/conversation-thread/message-list/file-upload/PreviewFooter.tsx";

type TFilePreviewOverlayProps = {
  files: File[];
  conversationId: string;
  onClose: () => void;
  onRemoveFile: (index: number) => void;
  onSendFiles: () => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedIndex >= files.length) setSelectedIndex(Math.max(0, files.length - 1));
  }, [files.length, selectedIndex]);

  const onHiddenPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files: choose } = e.target;
      if (choose && choose.length > 0) {
        const { errors, validFiles } = validateFiles(choose, files.length);
        errors.forEach((err) => ToastUtils.error(err));
        if (validFiles.length > 0) onFileSelect(validFiles);
      }
      e.target.value = "";
    },
    [files.length, onFileSelect]
  );

  const handleAddMore = () => {
    if (files.length >= MAX_FILES) {
      ToastUtils.error(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    fileInputRef.current?.click();
  };

  if (files.length === 0) return null;

  return (
    <View style={styles.container} className="bg-background-light dark:bg-background-dark">
      <View style={styles.contentRow}>
        <FileList
          files={files}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onRemoveFile={onRemoveFile}
        />
        <FilePreviewPane
          file={files[selectedIndex]}
          conversationId={conversationId}
          onSendMessage={onSendFiles}
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
        onClose={onClose}
        onSend={onSendFiles}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_FILE_TYPES}
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
