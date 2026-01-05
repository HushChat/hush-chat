import React, { useMemo } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { AppText } from "@/components/AppText";
import ConversationInput from "@/components/conversation-input/ConversationInput";
import { VideoPlayer } from "./ImageGrid/VideoPlayer";
import { LocalFile } from "@/hooks/useNativePickerUpload";
import { colorScheme } from "nativewind";

type TFilePreviewPaneProps = {
  file: LocalFile;
  conversationId: number;
  caption: string;
  onCaptionChange: (text: string) => void;
  onSendFiles: () => void;
  isSending: boolean;
  isGroupChat?: boolean;
  replyToMessage?: any;
  onCancelReply?: () => void;
  children?: React.ReactNode;
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
  children,
}: TFilePreviewPaneProps) => {
  const isDark = colorScheme.get() === "dark";
  const iconColor = isDark ? "#ffffff" : "#6B4EFF";

  const isVideo = useMemo(() => {
    if (!file) return false;
    return (
      (file.type && file.type.startsWith("video")) ||
      (file.name && !!file.name.match(/\.(mp4|mov|webm)$/i))
    );
  }, [file]);

  const isImage = useMemo(() => {
    if (!file) return false;
    return (
      (file.type && file.type.startsWith("image")) ||
      (file.name && !!file.name.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i))
    );
  }, [file]);

  if (!file) return null;

  return (
    <View className="flex-1 w-full">
      {/* MEDIA PREVIEW CONTAINER - This takes all available space */}
      <View className="flex-1 justify-center items-center px-4 bg-background-light dark:bg-background-dark overflow-hidden">
        {isImage ? (
          <Image
            source={{ uri: file.uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
          />
        ) : isVideo ? (
          <View className="w-full h-full bg-black rounded-xl overflow-hidden">
            <VideoPlayer uri={file.uri} style={{ width: "100%", height: "100%" }} />
          </View>
        ) : (
          <View className="items-center justify-center p-8 rounded-2xl max-w-[85%] bg-secondary-light/20 dark:bg-secondary-dark/30">
            <Ionicons name="document-text" size={80} color={iconColor} />
            <AppText className="mt-4 text-lg text-center font-medium text-text-primary-light dark:text-text-primary-dark">
              {file.name}
            </AppText>
            <AppText className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {file.size ? (file.size / 1024 / 1024).toFixed(2) : "?"} MB
            </AppText>
          </View>
        )}
      </View>

      {/* THUMBNAILS (Injected via children) */}
      <View className="bg-background-light dark:bg-background-dark">
        {children && <View className="py-2 bg-black/5 dark:bg-black/20">{children}</View>}

        {/* CAPTION INPUT */}
        <View className="px-2 pt-2 pb-2 border-t border-gray-200 dark:border-gray-800">
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
            hideAttachmentBtn={true}
            hideSendButton={true}
          />
        </View>
      </View>
    </View>
  );
};

export default FilePreviewPane;
