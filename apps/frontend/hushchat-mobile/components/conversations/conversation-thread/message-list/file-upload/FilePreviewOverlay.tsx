import React, { useEffect, useState, useRef, useCallback } from "react";
import { View } from "react-native";
import { ToastUtils } from "@/utils/toastUtils";
import { MAX_FILES, validateFiles } from "@/utils/fileValidation";
import FileList from "./FileList";
import FilePreviewPane from "./FilePreviewPane";
import PreviewFooter from "@/components/conversations/conversation-thread/message-list/file-upload/PreviewFooter.tsx";
import { ACCEPT_FILE_TYPES } from "@/constants/mediaConstants";

type TFilePreviewOverlayProps = {
  files: File[];
  onClose: () => void;
  onRemoveFile: (index: number) => void;
  onSendFiles: () => void;
  onFileSelect: (files: File[]) => void;
  isSending?: boolean;
  message?: string;
  onMessageChange?: (message: string) => void;
};

const FilePreviewOverlay = ({
  files,
  onClose,
  onRemoveFile,
  onSendFiles,
  onFileSelect,
  isSending = false,
  message = "",
  onMessageChange,
}: TFilePreviewOverlayProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [internalMsg, setInternalMsg] = useState(message);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setInternalMsg(message), [message]);

  useEffect(() => {
    if (selectedIndex >= files.length) setSelectedIndex(Math.max(0, files.length - 1));
  }, [files.length, selectedIndex]);

  const handleMessageChange = (t: string) => {
    setInternalMsg(t);
    onMessageChange?.(t);
  };

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
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 flex-row">
        <FileList
          files={files}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onRemoveFile={onRemoveFile}
        />
        <FilePreviewPane
          file={files[selectedIndex]}
          message={internalMsg}
          onMessageChange={handleMessageChange}
          isSending={isSending}
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
        style={{ display: "none" }}
        onChange={onHiddenPickerChange}
      />
    </View>
  );
};

export default FilePreviewOverlay;
