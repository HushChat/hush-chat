import React, { memo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import classNames from "classnames";
import { IMessage, MessageAttachmentTypeEnum } from "@/types/chat/types";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

interface ParentMessagePreviewProps {
  message: IMessage;
  parentMessage: IMessage;
  currentUserId: string;
  onNavigateToMessage?: (messageId: number) => void;
}

const ParentMessagePreview = memo<ParentMessagePreviewProps>(
  ({ message, parentMessage, currentUserId, onNavigateToMessage }) => {
    const isCurrentUser = message.senderId === Number(currentUserId);

    const firstAttachment = parentMessage.messageAttachments?.[0];
    const hasAttachment = !!firstAttachment;

    const attachmentType = firstAttachment?.type;
    const attachmentUrl = firstAttachment?.fileUrl;
    const fileName = firstAttachment?.originalFileName || "File";

    const getFallbackText = () => {
      if (attachmentType === MessageAttachmentTypeEnum.DOCUMENT) return fileName;
      if (attachmentType === MessageAttachmentTypeEnum.IMAGE) return "Photo";
      return "Attachment";
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
      >
        <View
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
            {message.senderId === Number(currentUserId) &&
            parentMessage?.senderId === Number(currentUserId)
              ? "Replying to myself"
              : message.senderId !== Number(currentUserId) &&
                  parentMessage?.senderId === Number(currentUserId)
                ? "Replying to me"
                : `Replying to ${parentMessage?.senderFirstName}`}
          </AppText>

          <View className="flex-row items-center justify-between gap-x-3">
            <View className="flex-1">
              <AppText
                className={classNames(
                  "text-sm leading-5",
                  isCurrentUser
                    ? "text-text-primary-light dark:text-text-primary-dark text-right"
                    : "text-text-primary-light dark:text-text-primary-dark text-left"
                )}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {parentMessage.messageText ? parentMessage.messageText : getFallbackText()}
              </AppText>
            </View>

            {hasAttachment && attachmentUrl && (
              <>
                {attachmentType === MessageAttachmentTypeEnum.DOCUMENT ? (
                  <View className="w-12 h-12 rounded-md bg-white items-center justify-center border border-gray-200 shadow-sm">
                    <AppText className="text-[10px] font-bold text-gray-500 text-center uppercase">
                      {firstAttachment?.originalFileName?.split(".").pop() || "DOC"}
                    </AppText>
                  </View>
                ) : (
                  <Image
                    source={{ uri: attachmentUrl }}
                    className="w-12 h-12 rounded-md bg-gray-200 dark:bg-gray-700"
                    resizeMode="cover"
                  />
                )}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

ParentMessagePreview.displayName = "ParentMessagePreview";
export default ParentMessagePreview;
