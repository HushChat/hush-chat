import React from "react";
import { View } from "react-native";
import classNames from "classnames";
import { IMessage } from "@/types/chat/types";
import MessageReactionsSummary from "@/components/conversations/conversation-thread/message-list/reaction/MessageReactionSummary";

interface MessageReactionsProps {
  message: IMessage;
  isCurrentUser: boolean;
  reactionSummary: any;
  hasReactions: boolean;
  onViewReactions: (position: { x: number; y: number }, isOpen: boolean) => void;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  message,
  isCurrentUser,
  reactionSummary,
  hasReactions,
  onViewReactions,
}) => {
  if (message.isUnsend) return null;

  return (
    hasReactions && (
      <View
        className={classNames("mt-1", {
          "items-start": !isCurrentUser,
          "items-end": isCurrentUser,
        })}
      >
        <MessageReactionsSummary
          reactions={reactionSummary}
          isCurrentUser={isCurrentUser}
          onPress={onViewReactions}
        />
      </View>
    )
  );
};
