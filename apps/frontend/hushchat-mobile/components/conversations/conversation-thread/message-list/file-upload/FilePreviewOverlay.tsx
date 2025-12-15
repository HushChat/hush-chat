import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { ToastUtils } from "@/utils/toastUtils";
import { MAX_FILES, validateFiles } from "@/utils/fileValidation";
import FileList from "./FileList";
import FilePreviewPane from "./FilePreviewPane";
import PreviewFooter from "@/components/conversations/conversation-thread/message-list/file-upload/PreviewFooter.tsx";
import { ACCEPT_FILE_TYPES } from "@/constants/mediaConstants";
import { TAttachmentWithCaption } from "@/hooks/conversation-thread/useConversationMessageSender";

type TFilePreviewOverlayProps = {
  files: File[];
  onClose: () => void;
  onRemoveFile: (index: number) => void;
  onSendFiles: (filesWithCaptions: TAttachmentWithCaption[]) => void;
  onFileSelect: (files: File[]) => void;
  isSending?: boolean;
};

const FilePreviewOverlay = ({
  files,
  onClose,
  onRemoveFile,
  onSendFiles,
  onFileSelect,
  isSending = false,
}: TFilePreviewOverlayProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [captions, setCaptions] = useState<Record<number, string>>({});
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

  const handleRemoveFileWithCaptionCleanup = useCallback(
    (index: number) => {
      onRemoveFile(index);

      setCaptions((prev) => {
        const newCaptions: Record<number, string> = {};
        Object.entries(prev).forEach(([key, value]) => {
          const keyNum = parseInt(key, 10);
          if (keyNum < index) {
            newCaptions[keyNum] = value;
          } else if (keyNum > index) {
            newCaptions[keyNum - 1] = value;
          }
        });
        return newCaptions;
      });
    },
    [onRemoveFile]
  );

  const onHiddenPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files: chosen } = e.target;
      if (chosen && chosen.length > 0) {
        const { errors, validFiles } = validateFiles(chosen, files.length);
        errors.forEach((err) => ToastUtils.error(err));
        if (validFiles.length > 0) {
          onFileSelect(validFiles);
        }
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

  const handleSend = useCallback(() => {
    const filesWithCaptions: TAttachmentWithCaption[] = files.map((file, index) => ({
      file,
      captionText: captions[index] ?? "",
    }));
    onSendFiles(filesWithCaptions);
  }, [files, captions, onSendFiles]);

  if (files.length === 0) return null;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 flex-row">
        <FileList
          files={files}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
          onRemoveFile={handleRemoveFileWithCaptionCleanup}
        />
        <FilePreviewPane
          file={files[selectedIndex]}
          message={currentCaption}
          onMessageChange={handleCaptionChange}
          isSending={isSending}
        />
      </View>

      <PreviewFooter
        isSending={isSending}
        isAtLimit={files.length >= MAX_FILES}
        hasFiles={files.length > 0}
        onAddMore={handleAddMore}
        onClose={onClose}
        onSend={handleSend}
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
  hiddenInput: {
    display: "none",
  },
});
