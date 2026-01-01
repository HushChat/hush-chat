import React from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_ACTIVITY, ICON_SIZE } from "@/constants/composerConstants";
import { useAppTheme } from "@/hooks/useAppTheme";

interface SendButtonProps {
  showSend: boolean;
  isSending: boolean;
  isRecording?: boolean;
  onPress: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export const SendButton = ({
  showSend,
  isSending,
  isRecording = false,
  onPress,
  onStartRecording,
  onStopRecording,
}: SendButtonProps) => {
  const { isDark } = useAppTheme();

  if (isSending) {
    return (
      <ActivityIndicator
        size="small"
        color={COLOR_ACTIVITY}
        className="absolute right-3 bottom-2"
      />
    );
  }

  if (isRecording) {
    return (
      <Pressable onPress={onStopRecording} className="absolute right-3 bottom-2">
        <Ionicons name="stop-circle" size={ICON_SIZE} color="#EF4444" />
      </Pressable>
    );
  }

  if (showSend) {
    return (
      <Pressable onPress={onPress} className="absolute right-3 bottom-2">
        <Ionicons
          name="send"
          size={ICON_SIZE}
          color={isDark ? "!text-primary-light" : "!text-primary-dark"}
        />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onStartRecording} className="absolute right-3 bottom-2">
      <Ionicons name="mic-sharp" size={ICON_SIZE} color={COLOR_ACTIVITY} />
    </Pressable>
  );
};
