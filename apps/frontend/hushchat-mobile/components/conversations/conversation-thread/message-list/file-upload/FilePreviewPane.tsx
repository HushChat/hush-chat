import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorScheme } from "nativewind";
import { Image } from "expo-image";
import { DOC_EXTENSIONS, SIZES } from "@/constants/mediaConstants";
import { AppText } from "@/components/AppText";
import ConversationInput from "@/components/conversation-input/ConversationInput";

type TFilePreviewPaneProps = {
  file: File;
  conversationId: string;
  onSendMessage: (message: string) => void;
  isSending: boolean;
  isGroupChat?: boolean;
  replyToMessage?: any;
  onCancelReply?: () => void;
};

const FilePreviewPane = ({
  file,
  conversationId,
  onSendMessage,
  isSending,
  isGroupChat = false,
  replyToMessage,
  onCancelReply,
}: TFilePreviewPaneProps) => {
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
          <Image source={{ uri: url }} contentFit="contain" style={styles.previewImage} />
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

      <View style={styles.inputContainer}>
        <ConversationInput
          conversationId={conversationId}
          onSendMessage={onSendMessage}
          disabled={isSending}
          isSending={isSending}
          placeholder={`Add a caption for your ${fileType === "document" ? "document" : "image"}...`}
          minLines={1}
          maxLines={4}
          isGroupChat={isGroupChat}
          replyToMessage={replyToMessage}
          onCancelReply={onCancelReply}
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
  inputContainer: {
    position: "relative",
    overflow: "visible",
    zIndex: 100,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
