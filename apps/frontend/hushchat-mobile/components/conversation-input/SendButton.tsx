import React from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_ACTIVITY, SEND_ICON_SIZE } from "@/constants/composerConstants";

interface SendButtonProps {
  showSend: boolean;
  isSending: boolean;
  onPress: () => void;
  isMessageEditing?: boolean;
}

export const SendButton = ({
  showSend,
  isSending,
  onPress,
  isMessageEditing = false,
}: SendButtonProps) => {
  if (isSending) {
    return (
      <ActivityIndicator
        size="small"
        color={COLOR_ACTIVITY}
        className="absolute right-3 bottom-2"
      />
    );
  }

  return (
    <Pressable onPress={onPress} className="absolute right-3 bottom-2" disabled={!showSend}>
      <Ionicons
        name={showSend || isMessageEditing ? "send" : "mic-sharp"}
        size={SEND_ICON_SIZE}
        className={"!text-primary-light dark:!text-primary-dark"}
      />
    </Pressable>
  );
};
