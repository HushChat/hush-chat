import React from "react";
import { View } from "react-native";
import classNames from "classnames";
import { IMessage, ReactionType } from "@/types/chat/types";
import ReactionPicker from "@/components/conversations/conversation-thread/message-list/reaction/ReactionPicker";
import MessageReactionsSummary from "@/components/conversations/conversation-thread/message-list/reaction/MessageReactionSummary";

interface MessageReactionsProps {
  message: IMessage;
  isCurrentUser: boolean;
  isPickerOpen: boolean;
  conversationIsBlocked: boolean;
  selectionMode: boolean;
  reactedByCurrentUser: string;
  reactionSummary: any;
  hasReactions: boolean;
  onSelectReaction: (reaction: ReactionType) => void;
  onCloseAllOverlays?: () => void;
  onViewReactions: (position: { x: number; y: number }, isOpen: boolean) => void;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  message,
  isCurrentUser,
  isPickerOpen,
  conversationIsBlocked,
  selectionMode,
  reactedByCurrentUser,
  reactionSummary,
  hasReactions,
  onSelectReaction,
  onCloseAllOverlays,
  onViewReactions,
}) => {
  if (message.isUnsend) return null;

  return (
    <>
      <ReactionPicker
        visible={isPickerOpen && !conversationIsBlocked && !selectionMode}
        reactedByCurrentUser={reactedByCurrentUser}
        onSelect={onSelectReaction}
        isCurrentUser={isCurrentUser}
        onRequestClose={onCloseAllOverlays}
      />

      {hasReactions && (
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
      )}
    </>
  );
};
