import React from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_ACTIVITY, ICON_SIZE } from "@/constants/composerConstants";

interface SendButtonProps {
  showSend: boolean;
  isSending: boolean;
  isRecording: boolean;
  onPress: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export const SendButton = ({
  showSend,
  isSending,
  isRecording,
  onPress,
  onStartRecording,
  onStopRecording,
}: SendButtonProps) => {
  if (isSending) {
    return <ActivityIndicator size="small" color={COLOR_ACTIVITY} />;
  }

  if (isRecording) {
    return (
      <Pressable onPress={onStopRecording} className="!text-gray-500 dark:!text-gray-400">
        <Ionicons name="stop-circle" size={ICON_SIZE} color="#EF4444" />
      </Pressable>
    );
  }

  if (showSend) {
    return (
      <Pressable onPress={onPress} disabled={!showSend}>
        <Ionicons name={"send"} size={ICON_SIZE} className="!text-gray-500 dark:!text-gray-400" />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onStartRecording} className="!text-gray-500 dark:!text-gray-400">
      <Ionicons name="mic-sharp" size={ICON_SIZE} color={COLOR_ACTIVITY} />
    </Pressable>
  );
};
