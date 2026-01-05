import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colorScheme } from "nativewind";
import classNames from "classnames";

import { AppText } from "@/components/AppText";
import { LocalFile } from "@/hooks/useNativePickerUpload";
import { ToastUtils } from "@/utils/toastUtils";
import { MAX_FILES } from "@/utils/fileValidation";

import FilePreviewPane from "./FilePreviewPane";
import PreviewFooter from "@/components/conversations/conversation-thread/message-list/file-upload/PreviewFooter.tsx";

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
  onAddMoreTrigger?: () => void;
  isSending?: boolean;
  isGroupChat?: boolean;
  replyToMessage?: any;
  onCancelReply?: () => void;
};

const THUMB_SIZE = 60;

const FilePreviewOverlay = ({
  files,
  conversationId,
  onClose,
  onRemoveFile,
  onSendFiles,
  onAddMoreTrigger,
  isSending = false,
  isGroupChat = false,
  replyToMessage,
  onCancelReply,
}: TFilePreviewOverlayProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [captions, setCaptions] = useState<Map<number, string>>(new Map());
  const isDark = colorScheme.get() === "dark";

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
      onAddMoreTrigger?.();
    }
  }, [files.length, onAddMoreTrigger]);

  const renderThumbnail = (file: LocalFile, index: number) => {
    const isSelected = index === selectedIndex;
    const isVid = file.type && file.type.startsWith("video");

    return (
      <TouchableOpacity
        key={`${file.uri}-${index}`}
        onPress={() => setSelectedIndex(index)}
        className={classNames(
          "mr-2 rounded-lg overflow-hidden relative border-2",
          isSelected ? "border-[#6B4EFF]" : "border-transparent"
        )}
        style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
      >
        {isVid ? (
          <View className="w-full h-full bg-[#1a1a1a] justify-center items-center">
            <Ionicons name="videocam" size={20} color="white" />
          </View>
        ) : (
          <Image source={{ uri: file.uri }} className="w-full h-full" contentFit="cover" />
        )}
        <TouchableOpacity
          className="absolute top-0.5 right-0.5 bg-black/60 rounded-full"
          onPress={() => handleRemoveFile(index)}
        >
          <Ionicons name="close-circle" size={18} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (!currentFile) return null;

  return (
    <Modal visible={files.length > 0} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        {/* Header - Fixed at top */}
        <View
          style={{ paddingTop: insets.top + 10 }}
          className="flex-row justify-between items-center px-4 pb-3 border-b border-black/10 dark:border-white/10 bg-background-light dark:bg-background-dark z-10"
        >
          <TouchableOpacity onPress={handleClose} className="p-1">
            <Ionicons name="close" size={28} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <AppText
            className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark max-w-[70%]"
            numberOfLines={1}
          >
            {currentFile.name || `File ${selectedIndex + 1}`}
          </AppText>
          <View className="flex-row items-center">
            {files.length > 1 && (
              <AppText className="text-xs text-text-secondary-light dark:text-text-secondary-dark mr-2">
                {selectedIndex + 1}/{files.length}
              </AppText>
            )}
          </View>
        </View>

        {/* Keyboard Avoiding Content Wrapper */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          {/* Main Preview Area - Tapping dismisses keyboard */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              >
                {/* Thumbnails passed as children to sit just above Input */}
                {files.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      alignItems: "center",
                    }}
                    style={{ maxHeight: 90 }}
                  >
                    <TouchableOpacity
                      className={classNames(
                        "justify-center items-center mr-2 border rounded-lg",
                        isDark
                          ? "bg-white/10 border-white/20"
                          : "bg-[#6B4EFF]/10 border-[#6B4EFF]/30"
                      )}
                      style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                      onPress={handleAddMore}
                      disabled={files.length >= MAX_FILES}
                    >
                      <Ionicons
                        name="add"
                        size={24}
                        color={files.length >= MAX_FILES ? "#9ca3af" : isDark ? "white" : "#6B4EFF"}
                      />
                    </TouchableOpacity>
                    {files.map(renderThumbnail)}
                  </ScrollView>
                )}
              </FilePreviewPane>
            </View>
          </TouchableWithoutFeedback>

          {/* Footer - Pushed up by KeyboardAvoidingView */}
          <View style={{ paddingBottom: insets.bottom }}>
            <PreviewFooter
              isSending={isSending}
              isAtLimit={files.length >= MAX_FILES}
              hasFiles={files.length > 0}
              onAddMore={handleAddMore}
              onClose={handleClose}
              onSend={handleSend}
              fileCount={files.length}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default FilePreviewOverlay;
