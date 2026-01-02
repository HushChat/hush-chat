import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { AppText } from "@/components/AppText";
import ConversationInput from "@/components/conversation-input/ConversationInput";
import { VideoPlayer } from "./ImageGrid/VideoPlayer";
import { LocalFile } from "@/hooks/useNativePickerUpload";
import { colorScheme } from "nativewind";
import { PLATFORM } from "@/constants/platformConstants";

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

const SCREEN_WIDTH = Dimensions.get("window").width;

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={PLATFORM.IS_IOS ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.previewContainer}>
        {isImage ? (
          <Image source={{ uri: file.uri }} style={styles.media} contentFit="contain" />
        ) : isVideo ? (
          <VideoPlayer uri={file.uri} style={styles.media} />
        ) : (
          <View style={styles.docPreview}>
            <Ionicons name="document-text" size={80} color={iconColor} />
            <AppText className="mt-4 text-lg text-center text-text-primary-light dark:text-text-primary-dark">
              {file.name}
            </AppText>
            <AppText className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {file.size ? (file.size / 1024 / 1024).toFixed(2) : "?"} MB
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.childrenWrapper}>{children}</View>

      <View style={styles.inputWrapper}>
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
          hideSendButton={false}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default FilePreviewPane;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  media: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  docPreview: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  childrenWrapper: {
    paddingBottom: 4,
  },
  inputWrapper: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
});
