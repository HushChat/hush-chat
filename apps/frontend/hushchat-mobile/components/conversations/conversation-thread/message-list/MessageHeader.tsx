import React from "react";
import { View, Pressable } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

interface IMessageHeaderProps {
  isCurrentUser: boolean;
  isGroupChat?: boolean;
  showSenderName: boolean;
  senderName: string;
  messageTime: string;
  messageIsUnsend?: boolean;
  isRead?: boolean;
  showMessageTime?: boolean;
  onClickSendernName?: () => void;
}

export const MessageHeader: React.FC<IMessageHeaderProps> = ({
  isCurrentUser,
  isGroupChat,
  showSenderName,
  senderName,
  messageTime,
  messageIsUnsend,
  isRead = false,
  showMessageTime = true,
  onClickSendernName,
}) => {
  return (
    <View
      className={classNames("flex-row items-center gap-2 mb-1", {
        "justify-end": isCurrentUser,
        "justify-start": !isCurrentUser,
      })}
    >
      {isGroupChat && showSenderName && (
        <Pressable onPress={onClickSendernName}>
          <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            {isCurrentUser ? "You" : senderName}
          </AppText>
        </Pressable>
      )}

      {showMessageTime && (
        <View className="flex-row items-center gap-1">
          <AppText className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            {messageTime}
          </AppText>

          {isCurrentUser && !messageIsUnsend && (
            <Ionicons name="checkmark-done" size={14} color={isRead ? "#3B82F6" : "#9CA3AF"} />
          )}
        </View>
      )}
    </View>
  );
};
