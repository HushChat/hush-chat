import React from "react";
import { GestureResponderEvent, View } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { MessageActions } from "./MessageActions";

interface IMessageHeaderProps {
  isCurrentUser: boolean;
  isGroupChat?: boolean;
  senderName: string;
  messageText?: string;
  messageTime: string;
  messageIsUnsend?: boolean;
  selectionMode: boolean;
  currentUserId: string;
  isRead?: boolean;
  onOpenPicker: () => void;
  onOpenMenu: (event: GestureResponderEvent) => void;
}

export const MessageHeader: React.FC<IMessageHeaderProps> = ({
  isCurrentUser,
  isGroupChat,
  senderName,
  messageText,
  messageTime,
  messageIsUnsend,
  selectionMode,
  currentUserId,
  isRead = false,
  onOpenPicker,
  onOpenMenu,
}) => {
  return (
    <View
      className={classNames("flex-row items-center gap-2 mb-1", {
        "justify-end": isCurrentUser,
        "justify-start": !isCurrentUser,
      })}
    >
      {isCurrentUser && (
        <MessageActions
          messageText={messageText}
          messageIsUnsend={messageIsUnsend}
          selectionMode={selectionMode}
          onOpenPicker={onOpenPicker}
          onOpenMenu={onOpenMenu}
          currentUserId={currentUserId}
          isCurrentUser={isCurrentUser}
        />
      )}

      {isGroupChat && (
        <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          {isCurrentUser ? "You" : senderName}
        </AppText>
      )}

      <View className="flex-row items-center gap-1">
        <AppText className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {messageTime}
        </AppText>

        {isCurrentUser && !messageIsUnsend && (
          <Ionicons name="checkmark-done" size={14} color={isRead ? "#3B82F6" : "#9CA3AF"} />
        )}
      </View>

      {!isCurrentUser && (
        <MessageActions
          messageText={messageText}
          messageIsUnsend={messageIsUnsend}
          selectionMode={selectionMode}
          onOpenPicker={onOpenPicker}
          onOpenMenu={onOpenMenu}
          currentUserId={currentUserId}
          isCurrentUser={isCurrentUser}
        />
      )}
    </View>
  );
};
