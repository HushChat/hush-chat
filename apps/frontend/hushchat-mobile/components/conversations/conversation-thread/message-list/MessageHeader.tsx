import React from "react";
import { GestureResponderEvent, View, Pressable } from "react-native";
import classNames from "classnames";
import { AppText } from "@/components/AppText";
import { MessageActions } from "./MessageActions";

interface IMessageHeaderProps {
  isCurrentUser: boolean;
  isGroupChat?: boolean;
  showSenderName: boolean;
  senderName: string;
  messageText?: string;
  messageIsUnsend?: boolean;
  selectionMode: boolean;
  currentUserId: string;
  onOpenPicker: () => void;
  onOpenMenu: (event: GestureResponderEvent) => void;
  onClickSendernName?: () => void;
}

export const MessageHeader: React.FC<IMessageHeaderProps> = ({
  isCurrentUser,
  isGroupChat,
  showSenderName,
  senderName,
  messageText,
  messageIsUnsend,
  selectionMode,
  currentUserId,
  onOpenPicker,
  onOpenMenu,
  onClickSendernName,
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

      {isGroupChat && showSenderName && (
        <Pressable onPress={onClickSendernName}>
          <AppText className="text-sm font-semibold text-primary-light dark:text-primary-dark">
            {isCurrentUser ? "You" : senderName}
          </AppText>
        </Pressable>
      )}

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
