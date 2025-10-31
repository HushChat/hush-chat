import React, { useEffect, useMemo, useState } from "react";
import { View, TextInput, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorScheme } from "nativewind";
import { Image } from "expo-image";
import { DOC_EXTENSIONS, SIZES } from "@/constants/mediaConstants";

type TFilePreviewPaneProps = {
  file: File;
  message: string;
  onMessageChange: (text: string) => void;
  isSending: boolean;
};

const FilePreviewPane = ({ file, message, onMessageChange, isSending }: TFilePreviewPaneProps) => {
  const [url, setUrl] = useState("");
  const [fileType, setFileType] = useState<"image" | "document">("image");

  const isDark = colorScheme.get() === "dark";
  const iconColor = isDark ? "#ffffff" : "#6B4EFF";

  const K = 1024;

  useEffect(() => {
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    const isDocument = DOC_EXTENSIONS.includes(ext || "");
    setFileType(isDocument ? "document" : "image");

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
          <Image
            source={{ uri: url }}
            contentFit="contain"
            style={{ width: "100%", height: 420 }}
          />
        ) : (
          <View className="items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-secondary-light/20 dark:bg-secondary-dark/30">
            <Ionicons name="document-text-outline" size={64} color={iconColor} />
            <Text className="mt-4 text-lg font-medium text-text-primary-light dark:text-text-primary-dark">
              {file.name}
            </Text>
            <Text className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {prettySize}
            </Text>
          </View>
        )}
      </View>

      <View className="px-6 pb-4">
        <TextInput
          className="w-full outline-none rounded-xl bg-secondary-light/60 dark:bg-secondary-dark/70 border border-gray-200 dark:border-gray-700 px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
          placeholder={`Write a caption for your ${fileType === "document" ? "document" : "image"}...`}
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          value={message}
          onChangeText={onMessageChange}
          editable={!isSending}
          style={{ minHeight: 84, maxHeight: 140, textAlignVertical: "top" }}
        />
      </View>
    </View>
  );
};

export default FilePreviewPane;
