import React, { useMemo } from "react";
import {
  View,
  KeyboardAvoidingView,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { AppText } from "@/components/AppText";
import ConversationInput from "@/components/conversation-input/ConversationInput/ConversationInput";
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
  keyboardOffset?: number;
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
  keyboardOffset = 0,
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
      className="flex-1"
      behavior={PLATFORM.IS_IOS ? "padding" : undefined}
      keyboardVerticalOffset={PLATFORM.IS_IOS ? keyboardOffset : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-background-light dark:bg-background-dark">
          {isImage ? (
            <Image
              source={{ uri: file.uri }}
              style={{ width: SCREEN_WIDTH, height: "100%" }}
              contentFit="contain"
            />
          ) : isVideo ? (
            <VideoPlayer uri={file.uri} style={{ width: SCREEN_WIDTH, height: "100%" }} />
          ) : (
            <View className="items-center justify-center p-6 bg-secondary-light/20 dark:bg-secondary-dark/30 rounded-2xl border border-gray-200 dark:border-gray-700">
              <Ionicons name="document-text" size={80} color={iconColor} />
              <AppText
                numberOfLines={2}
                ellipsizeMode="middle"
                className="mt-4 text-lg text-center font-medium text-text-primary-light dark:text-text-primary-dark"
              >
                {file.name}
              </AppText>
              <AppText className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {file.size ? (file.size / 1024 / 1024).toFixed(2) : "?"} MB
              </AppText>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      <View className="pb-1 bg-background-light dark:bg-background-dark">{children}</View>

      <View className="px-1 pb-1 bg-background-light dark:bg-background-dark">
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
          hideSendButton
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default FilePreviewPane;
