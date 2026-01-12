import React, { useEffect, useState, useCallback } from "react";
import { View, TouchableOpacity, ScrollView, Modal } from "react-native"; // Removed Keyboard import
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import classNames from "classnames";

import { AppText } from "@/components/AppText";
import { LocalFile } from "@/hooks/useNativePickerUpload";
import { ToastUtils } from "@/utils/toastUtils";
import { MAX_FILES } from "@/utils/fileValidation";

import FilePreviewPane from "./FilePreviewPane";
import PreviewFooter from "./PreviewFooter";
import { useAppTheme } from "@/hooks/useAppTheme";

export type NativeFileWithCaption = {
  file: LocalFile;
  caption: string;
};

type TFilePreviewOverlayProps = {
  files: LocalFile[];
  conversationId: number;
  onClose: () => void;
  onRemoveFile: (index: number) => void;
  onSendFiles: (filesWithCaptions: NativeFileWithCaption[]) => void;
  onFileSelect?: () => void;
  isSending?: boolean;
  isGroupChat?: boolean;
  replyToMessage?: any;
  onCancelReply?: () => void;
};

const THUMB_SIZE = 64;
const HEADER_HEIGHT = 60;

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
  const [captions, setCaptions] = useState<Map<number, string>>(new Map());

  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (selectedIndex >= files.length && files.length > 0) {
      setSelectedIndex(files.length - 1);
    }
  }, [files.length, selectedIndex]);

  const currentFile = files[selectedIndex];

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
    const filesWithCaptions = files.map((file, index) => ({
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

  const handleAddMore = useCallback(() => {
    if (files.length >= MAX_FILES) {
      ToastUtils.error(`Maximum ${MAX_FILES} files allowed.`);
    } else {
      onFileSelect?.();
    }
  }, [files.length, onFileSelect]);

  const renderThumbnail = (file: LocalFile, index: number) => {
    const isSelected = index === selectedIndex;
    const isVid = file.type && file.type.startsWith("video");

    return (
      <TouchableOpacity
        key={`${file.uri}-${index}`}
        onPress={() => setSelectedIndex(index)}
        className={classNames(
          "mr-2 rounded-lg overflow-hidden relative border-2",
          isSelected ? "border-primary-light dark:border-primary-dark" : "border-transparent"
        )}
        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
      >
        {isVid ? (
          <View className="w-full h-full bg-gray-900 justify-center items-center">
            <Ionicons name="videocam" size={20} color="white" />
          </View>
        ) : (
          <Image
            source={{ uri: file.uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        )}
        <TouchableOpacity
          className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5"
          onPress={() => handleRemoveFile(index)}
        >
          <Ionicons name="close" size={14} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (!currentFile) return null;

  const headerOffset = insets.top + HEADER_HEIGHT;

  return (
    <Modal visible={files.length > 0} animationType="slide" onRequestClose={onClose}>
      <View
        className="flex-1 bg-background-light dark:bg-background-dark"
        style={{ paddingBottom: 0 }}
      >
        <View
          className="flex-row items-center px-4 border-b border-gray-100 dark:border-gray-800 bg-background-light dark:bg-background-dark z-10"
          style={{ paddingTop: insets.top, height: headerOffset }}
        >
          <TouchableOpacity
            onPress={handleClose}
            className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-800"
          >
            <Ionicons name="close" size={28} color={isDark ? "white" : "black"} />
          </TouchableOpacity>

          <View className="flex-1 mx-2">
            <AppText
              numberOfLines={1}
              ellipsizeMode="middle"
              className="text-lg font-bold text-center text-text-primary-light dark:text-text-primary-dark"
            >
              {currentFile.name}
            </AppText>
            {files.length > 1 && (
              <AppText className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark">
                {selectedIndex + 1} of {files.length}
              </AppText>
            )}
          </View>
          <View style={{ width: 32 }} />
        </View>

        <View className="flex-1">
          <FilePreviewPane
            file={currentFile}
            conversationId={conversationId}
            caption={captions.get(selectedIndex) || ""}
            onCaptionChange={handleCaptionChange}
            onSendFiles={handleSend}
            isSending={isSending}
            isGroupChat={isGroupChat}
            replyToMessage={replyToMessage}
            onCancelReply={onCancelReply}
            keyboardOffset={headerOffset}
          >
            {files.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
                className="max-h-24 bg-background-light/95 dark:bg-background-dark/95"
                keyboardShouldPersistTaps="handled"
              >
                <TouchableOpacity
                  onPress={handleAddMore}
                  disabled={files.length >= MAX_FILES}
                  className={classNames(
                    "justify-center items-center mr-2 rounded-lg border border-dashed",
                    files.length >= MAX_FILES
                      ? "border-gray-300 bg-gray-50"
                      : "border-primary-light/40 bg-primary-light/10 dark:border-primary-dark/40 dark:bg-primary-dark/10"
                  )}
                  style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                >
                  <Ionicons
                    name="add"
                    size={28}
                    color={files.length >= MAX_FILES ? "#9ca3af" : isDark ? "white" : "#6B4EFF"}
                  />
                </TouchableOpacity>
                {files.map(renderThumbnail)}
              </ScrollView>
            )}
          </FilePreviewPane>
        </View>

        <PreviewFooter
          isSending={isSending}
          isAtLimit={files.length >= MAX_FILES}
          hasFiles={files.length > 0}
          onClose={handleClose}
          onSend={handleSend}
          fileCount={files.length}
        />
      </View>
    </Modal>
  );
};

export default FilePreviewOverlay;
