import React from "react";
import { GestureResponderEvent, View } from "react-native";
import classNames from "classnames";
import { AppText } from "@/components/AppText";
import { MessageActions } from "./MessageActions";

interface IMessageHeaderProps {
  isCurrentUser: boolean;
  isGroupChat?: boolean;
  senderName: string;
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
  messageTime,
  messageIsUnsend,
  selectionMode,
  currentUserId,
  onOpenPicker,
  onOpenMenu,
}) => {
  const elements = [
    {
      key: "actions",
      component: (
        <MessageActions
          messageIsUnsend={messageIsUnsend}
          selectionMode={selectionMode}
          onOpenPicker={onOpenPicker}
          onOpenMenu={onOpenMenu}
          currentUserId={currentUserId}
        />
      ),
    },
    ...(isGroupChat
      ? [
          {
            key: "name",
            component: (
              <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                {isCurrentUser ? "You" : senderName}
              </AppText>
            ),
          },
        ]
      : []),
    {
      key: "time",
      component: (
        <AppText className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {messageTime}
        </AppText>
      ),
    },
  ];

  // For current user: actions should be first (left), for others: actions should be last (right)
  const orderedElements = isCurrentUser ? elements : elements.reverse();

  return (
    <View
      className={classNames("flex-row items-center gap-2 mb-1", {
        "justify-end": isCurrentUser,
        "justify-start": !isCurrentUser,
      })}
    >
      {orderedElements.map((el) => (
        <React.Fragment key={el.key}>{el.component}</React.Fragment>
      ))}
    </View>
  );
};
