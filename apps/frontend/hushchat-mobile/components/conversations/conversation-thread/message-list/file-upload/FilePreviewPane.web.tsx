import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorScheme } from "nativewind";
import { Image } from "expo-image";
import { SIZES } from "@/constants/mediaConstants";
import { getFileType } from "@/utils/files/getFileType";
import { isLocalPreviewSupported } from "@/utils/filePreviewUtils";
import { AppText } from "@/components/AppText";
import ConversationInput from "@/components/conversation-input/ConversationInput";
import { VideoPlayer } from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid/VideoPlayer";

type TFilePreviewPaneProps = {
  file: File;
  conversationId: number;
  caption: string;
  onCaptionChange: (text: string) => void;
  onSendFiles: () => void;
  isSending: boolean;
  isGroupChat?: boolean;
  replyToMessage?: any;
  onCancelReply?: () => void;
};

const FilePreviewPane = ({
  file,
  conversationId,
  caption,
  onCaptionChange,
  onSendFiles,
  isSending,
  isGroupChat = false,
  replyToMessage,
  onCancelReply,
}: TFilePreviewPaneProps) => {
  const [url, setUrl] = useState("");
  const [fileType, setFileType] = useState<"image" | "document" | "video" | "unsupported">("image");
  const [loading, setLoading] = useState(false);

  const isDark = colorScheme.get() === "dark";
  const iconColor = isDark ? "#ffffff" : "#6B4EFF";
  const K = 1024;

  const isIframePreviewable = isLocalPreviewSupported(file?.name || "");

  useEffect(() => {
    if (!file) return;

    const type = getFileType(file.name);
    setFileType(type);

    if (isIframePreviewable) {
      setLoading(true);
    }

    const objUrl = URL.createObjectURL(file);
    setUrl(objUrl);

    return () => {
      URL.revokeObjectURL(objUrl);
      setLoading(false);
    };
  }, [file, isIframePreviewable]);

  const prettySize = useMemo(() => {
    const bytes = file?.size ?? 0;
    if (bytes === 0) return "0 Bytes";
    const i = Math.min(SIZES.length - 1, Math.floor(Math.log(bytes) / Math.log(K)));
    return `${parseFloat((bytes / Math.pow(K, i)).toFixed(2))} ${SIZES[i]}`;
  }, [file]);

  if (!file) return null;

  const renderPreviewContent = () => {
    if (fileType === "image") {
      return <Image source={{ uri: url }} contentFit="contain" style={styles.previewImage} />;
    }

    if (fileType === "video") {
      return (
        <View style={styles.videoContainer}>
          <VideoPlayer uri={url} style={styles.video} />
        </View>
      );
    }

    if (isIframePreviewable && url) {
      return (
        <View className="w-full h-full bg-white rounded-lg overflow-hidden border border-gray-200 relative">
          <iframe
            key={url}
            className="custom-scrollbar"
            src={`${url}#toolbar=0&navpanes=0`}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={file.name}
            onLoad={() => setLoading(false)}
          />
          {loading && (
            <View className="absolute inset-0 justify-center items-center bg-white/80">
              <ActivityIndicator size="large" color={iconColor} />
            </View>
          )}
        </View>
      );
    }

    return (
      <View className="items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-secondary-light/20 dark:bg-secondary-dark/30">
        <Ionicons name="document-text-outline" size={64} color={iconColor} />
        <AppText className="mt-4 text-lg font-medium text-text-primary-light dark:text-text-primary-dark">
          {file.name}
        </AppText>
        <AppText className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {prettySize}
        </AppText>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 items-center justify-center px-6 py-4">{renderPreviewContent()}</View>

      <View style={styles.inputContainer}>
        <ConversationInput
          conversationId={conversationId}
          onSendMessage={onSendFiles}
          disabled={isSending}
          isSending={isSending}
          isGroupChat={isGroupChat}
          replyToMessage={replyToMessage}
          onCancelReply={onCancelReply}
          controlledValue={caption}
          onControlledValueChange={onCaptionChange}
          hideSendButton
        />
      </View>
    </View>
  );
};

export default FilePreviewPane;

const styles = StyleSheet.create({
  previewImage: {
    width: "100%",
    height: "100%",
    maxHeight: 500,
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    maxHeight: 500,
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  inputContainer: {
    position: "relative",
    overflow: "visible",
    zIndex: 100,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
