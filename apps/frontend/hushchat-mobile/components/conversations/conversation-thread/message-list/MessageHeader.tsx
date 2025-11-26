import React from "react";
import { GestureResponderEvent, View } from "react-native";
import classNames from "classnames";
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

      <AppText className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
        {messageTime}
      </AppText>

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
