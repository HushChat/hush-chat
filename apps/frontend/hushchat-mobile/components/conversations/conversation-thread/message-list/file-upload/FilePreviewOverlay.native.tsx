import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colorScheme } from "nativewind";

import { AppText } from "@/components/AppText";
import { LocalFile } from "@/hooks/useNativePickerUpload";
import { ToastUtils } from "@/utils/toastUtils";
import { MAX_FILES } from "@/utils/fileValidation";

// Import the new component
import FilePreviewPane from "./FilePreviewPane";

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
  onFileSelect?: any;
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

  // 1. Get exact insets
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

  const handleSend = useCallback(() => {
    const filesWithCaptions = files.map((file, index) => ({
      file,
      caption: captions.get(index) || "",
    }));
    onSendFiles(filesWithCaptions);
    setCaptions(new Map());
  }, [files, captions, onSendFiles]);

  const renderThumbnail = (file: LocalFile, index: number) => {
    const isSelected = index === selectedIndex;
    const isVid = file.type && file.type.startsWith("video");

    return (
      <TouchableOpacity
        key={`${file.uri}-${index}`}
        onPress={() => setSelectedIndex(index)}
        style={[styles.thumbnailWrapper, isSelected && { borderColor: "#6B4EFF", borderWidth: 2 }]}
      >
        {isVid ? (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam" size={20} color="white" />
          </View>
        ) : (
          <Image source={{ uri: file.uri }} style={styles.thumbnail} contentFit="cover" />
        )}
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemoveFile(index)}>
          <Ionicons name="close-circle" size={18} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (!currentFile) return null;

  return (
    <Modal visible={files.length > 0} animationType="slide" onRequestClose={onClose}>
      {/* 2. Use a View instead of SafeAreaView and apply insets manually */}
      <View
        style={[
          styles.container,
          { paddingBottom: insets.bottom }, // Handle bottom safe area
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            // 3. Apply top inset + extra 10px spacing
            { paddingTop: insets.top + 10 },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeHeaderBtn}>
            <Ionicons name="close" size={28} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <AppText className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Preview {files.length > 1 ? `(${selectedIndex + 1}/${files.length})` : ""}
          </AppText>
          <View style={{ width: 28 }} />
        </View>

        {/* Main Pane */}
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          >
            <TouchableOpacity
              style={styles.addMoreBtn}
              onPress={() => {
                if (files.length >= MAX_FILES) {
                  ToastUtils.error("Max files reached");
                } else {
                  onAddMoreTrigger?.();
                }
              }}
            >
              <Ionicons name="add" size={24} color={isDark ? "white" : "black"} />
            </TouchableOpacity>
            {files.map(renderThumbnail)}
          </ScrollView>
        </FilePreviewPane>
      </View>
    </Modal>
  );
};

export default FilePreviewOverlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10, // Added slight bottom padding to header
    backgroundColor: "transparent",
  },
  closeHeaderBtn: {
    padding: 4,
  },
  thumbnailList: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
  },
  thumbnailWrapper: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    marginRight: 8,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
  },
  addMoreBtn: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
});
