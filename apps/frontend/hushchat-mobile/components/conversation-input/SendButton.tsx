/**
 * SendButton
 *
 * Send/mic button with loading state indicator.
 */

import React from "react";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_ACTIVITY, SEND_ICON_SIZE } from "@/constants/composerConstants";

interface SendButtonProps {
  showSend: boolean;
  isSending: boolean;
  onPress: () => void;
}

export const SendButton: React.FC<SendButtonProps> = ({ showSend, isSending, onPress }) => {
  if (isSending) {
    return (
      <ActivityIndicator
        size="small"
        color={COLOR_ACTIVITY}
        className="absolute right-3 bottom-2"
      />
    );
  }

  if (showSend) {
    return (
      <Ionicons
        name="send"
        size={SEND_ICON_SIZE}
        onPress={onPress}
        className="absolute right-3 bottom-2 !text-primary-light dark:!text-primary-dark"
      />
    );
  }

  return (
    <Ionicons
      name="mic-sharp"
      size={SEND_ICON_SIZE}
      color={COLOR_ACTIVITY}
      className="absolute right-3 bottom-2"
    />
  );
};
