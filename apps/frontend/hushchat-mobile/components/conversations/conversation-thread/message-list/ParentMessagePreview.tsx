import React, { memo } from "react";
import { TouchableOpacity, View } from "react-native";
import classNames from "classnames";
import { IMessage } from "@/types/chat/types";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AttachmentPreview } from "@/components/conversations/conversation-thread/message-list/AttachmentPreview";
import { ParentMessageTextPreview } from "@/components/conversations/conversation-thread/message-list/ParentMessageTextPreview";

interface ParentMessagePreviewProps {
  message: IMessage;
  parentMessage: IMessage;
  currentUserId: string;
  onNavigateToMessage?: (messageId: number) => void;
}

const ParentMessagePreview = memo<ParentMessagePreviewProps>(
  ({ message, parentMessage, currentUserId, onNavigateToMessage }) => {
    const isCurrentUser = message.senderId === Number(currentUserId);

    const attachment = parentMessage.messageAttachments?.[0];
    const showMediaPreview = !!attachment;

    const getHeaderLabel = () => {
      const isSelfReply =
        message.senderId === Number(currentUserId) &&
        parentMessage?.senderId === Number(currentUserId);
      const isReplyingToMe =
        message.senderId !== Number(currentUserId) &&
        parentMessage?.senderId === Number(currentUserId);

      if (isSelfReply) return "Replying to myself";
      if (isReplyingToMe) return "Replying to me";
      return `Replying to ${parentMessage?.senderFirstName}`;
    };

    const handlePress = () => {
      if (onNavigateToMessage && parentMessage?.id) {
        onNavigateToMessage(parentMessage.id);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={onNavigateToMessage ? DEFAULT_ACTIVE_OPACITY : 1}
        onPress={handlePress}
        disabled={!onNavigateToMessage}
        className={classNames(
          "max-w-[75%] border-l-4 px-3 py-2 rounded-md mb-2",
          isCurrentUser
            ? "self-end border-primary-light bg-secondary-light dark:border-primary-dark dark:bg-secondary-dark"
            : "self-start border-primary-dark bg-secondary-light dark:border-primary-light dark:bg-secondary-dark"
        )}
      >
        <AppText
          className={classNames(
            "text-xs font-semibold mb-1",
            isCurrentUser
              ? "text-primary-light text-right"
              : "text-primary-dark dark:text-primary-light text-left"
          )}
        >
          {getHeaderLabel()}
        </AppText>

        <View className="flex-row items-center justify-between gap-x-3">
          <ParentMessageTextPreview message={parentMessage} isCurrentUser={isCurrentUser} />

          {showMediaPreview && <AttachmentPreview attachment={attachment} />}
        </View>
      </TouchableOpacity>
    );
  }
);

ParentMessagePreview.displayName = "ParentMessagePreview";
export default ParentMessagePreview;
