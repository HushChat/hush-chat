import React from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_ACTIVITY, ICON_SIZE } from "@/constants/composerConstants";

interface SendButtonProps {
  showSend: boolean;
  isSending: boolean;
  onPress: () => void;
}

export const SendButton = ({ showSend, isSending, onPress }: SendButtonProps) => {
  if (isSending) {
    return <ActivityIndicator size="small" color={COLOR_ACTIVITY} />;
  }

  return (
    <Pressable onPress={onPress} disabled={!showSend}>
      <Ionicons
        name={showSend ? "send" : "mic-sharp"}
        size={ICON_SIZE}
        className="!text-primary-light dark:!text-primary-dark"
      />
    </Pressable>
  );
};
