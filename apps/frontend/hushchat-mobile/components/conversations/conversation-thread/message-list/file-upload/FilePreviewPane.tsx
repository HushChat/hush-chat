import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorScheme } from "nativewind";
import { Image } from "expo-image";
import { DOC_EXTENSIONS, SIZES, VIDEO_EXTENSIONS } from "@/constants/mediaConstants";
import { AppText, AppTextInput } from "@/components/AppText";

const VideoPlayer = ({ uri, style }: { uri: string; style: any }) => {
  return (
    <video src={uri} style={style} controls preload="metadata" className="rounded-lg">
      Your browser does not support the video tag.
    </video>
  );
};

type TFilePreviewPaneProps = {
  file: File;
  message: string;
  onMessageChange: (text: string) => void;
  isSending: boolean;
};

const FilePreviewPane = ({ file, message, onMessageChange, isSending }: TFilePreviewPaneProps) => {
  const [url, setUrl] = useState("");
  const [fileType, setFileType] = useState<"image" | "document" | "video">("image");

  const isDark = colorScheme.get() === "dark";
  const iconColor = isDark ? "#ffffff" : "#6B4EFF";

  const K = 1024;

  useEffect(() => {
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    const isDocument = DOC_EXTENSIONS.includes(ext || "");
    const isVideo = VIDEO_EXTENSIONS.includes(ext || "");

    setFileType(isDocument ? "document" : isVideo ? "video" : "image");

    if (!isDocument) {
      const obj = URL.createObjectURL(file);
      setUrl(obj);
      return () => URL.revokeObjectURL(obj);
    }
  }, [file]);

  const prettySize = useMemo(() => {
    const bytes = file?.size ?? 0;
    if (bytes === 0) return "0 Bytes";
    const i = Math.min(SIZES.length - 1, Math.floor(Math.log(bytes) / Math.log(K)));
    return `${parseFloat((bytes / Math.pow(K, i)).toFixed(2))} ${SIZES[i]}`;
  }, [file]);

  if (!file) return null;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 items-center justify-center px-6">
        {fileType === "image" ? (
          <Image source={{ uri: url }} contentFit="contain" style={styles.previewImage} />
        ) : fileType === "video" ? (
          <View style={styles.videoContainer}>
            <VideoPlayer uri={url} style={styles.video} />
          </View>
        ) : (
          <View className="items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-secondary-light/20 dark:bg-secondary-dark/30">
            <Ionicons name="document-text-outline" size={64} color={iconColor} />
            <AppText className="mt-4 text-lg font-medium text-text-primary-light dark:text-text-primary-dark">
              {file.name}
            </AppText>
            <AppText className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {prettySize}
            </AppText>
          </View>
        )}
      </View>

      <View className="px-6 pb-4">
        <AppTextInput
          className="w-full outline-none rounded-xl bg-secondary-light/60 dark:bg-secondary-dark/70 border border-gray-200 dark:border-gray-700 px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
          placeholder={`Write a caption for your ${fileType === "document" ? "document" : fileType === "video" ? "video" : "image"}...`}
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          value={message}
          onChangeText={onMessageChange}
          editable={!isSending}
          style={styles.captionInput}
        />
      </View>
    </View>
  );
};

export default FilePreviewPane;

const styles = StyleSheet.create({
  previewImage: {
    width: "100%",
    height: 420,
  },
  videoContainer: {
    width: "100%",
    height: 420,
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  captionInput: {
    minHeight: 84,
    maxHeight: 140,
    textAlignVertical: "top",
  },
});
