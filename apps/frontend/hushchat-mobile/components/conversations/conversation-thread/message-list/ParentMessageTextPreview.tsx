import { View } from "react-native";
import { AppText } from "@/components/AppText";
import classNames from "classnames";
import { IMessage, MessageAttachmentTypeEnum } from "@/types/chat/types";

interface ParentMessageTextPreviewProps {
  message: IMessage;
  isCurrentUser: boolean;
}

export const ParentMessageTextPreview = ({
  message,
  isCurrentUser,
}: ParentMessageTextPreviewProps) => {
  const getDisplayText = () => {
    if (message.messageText) return message.messageText;

    const firstAttachment = message.messageAttachments?.[0];
    if (!firstAttachment) return "Message";

    if (firstAttachment.type === MessageAttachmentTypeEnum.DOCS) {
      return firstAttachment.originalFileName || "File";
    }
    if (firstAttachment.type === MessageAttachmentTypeEnum.MEDIA) {
      return "Photo";
    }
    return "Attachment";
  };

  return (
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
        {getDisplayText()}
      </AppText>
    </View>
  );
};
