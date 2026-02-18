import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import LastMessagePreview from "@/components/UnsendMessagePreview";
import { type IMessage, MessageAttachmentTypeEnum, MessageTypeEnum } from "@/types/chat/types";
import { hasGif } from "@/utils/messageUtils";
import { useUserStore } from "@/store/user/useUserStore";
import { isAudioAttachment } from "@/utils/messageHelpers";

interface LastMessagePreviewContentProps {
  lastMessage: IMessage | undefined;
  isGroup: boolean;
}

export const LastMessagePreviewContent = ({
  lastMessage,
  isGroup,
}: LastMessagePreviewContentProps) => {
  const { user } = useUserStore();
  const amISentTheMessage = user?.id && lastMessage?.senderId === user.id;

  let prefix = "";
  if (amISentTheMessage) {
    prefix = "You:";
  } else if (isGroup) {
    prefix = `${lastMessage?.senderFirstName}: `;
  }

  if (!lastMessage) return "No Messages Yet";
  const isGif = hasGif(lastMessage);

  if (lastMessage.isUnsend) {
    return <LastMessagePreview unsendMessage={lastMessage} />;
  }

  const firstAttachment = lastMessage.messageAttachments?.[0];
  const isVoice =
    firstAttachment &&
    (firstAttachment.type === MessageAttachmentTypeEnum.AUDIO ||
      isAudioAttachment(firstAttachment));

  if (lastMessage.hasAttachment && isVoice) {
    return (
      <View className="flex-row items-center gap-1">
        <AppText className="text-gray-600 dark:text-text-secondary-dark text-sm">{prefix}</AppText>
        <Ionicons name="mic" size={14} color="#6B7280" />
        <AppText className="text-gray-600 dark:text-text-secondary-dark text-sm">
          Voice Message
        </AppText>
      </View>
    );
  }

  if (lastMessage.hasAttachment && !isGif) {
    return (
      <View className="flex-row items-center gap-1">
        <AppText className="text-gray-600 dark:text-text-secondary-dark text-sm">{prefix}</AppText>
        <View style={styles.attachmentIcon}>
          <MaterialIcons name="attachment" size={14} color="#6B7280" />
        </View>
        <AppText className="text-gray-600 dark:text-text-secondary-dark text-sm">
          Attachment
        </AppText>
      </View>
    );
  }

  if (lastMessage.hasAttachment && isGif) {
    return (
      <View className="flex-row items-center gap-1 flex-1">
        <AppText className="text-gray-600 dark:text-text-secondary-dark text-sm">{prefix}</AppText>
        <MaterialIcons
          name="gif"
          size={20}
          className="text-gray-600 dark:text-text-secondary-dark"
          color="#4B5563"
        />
        <AppText
          className="text-gray-600 dark:text-text-secondary-dark text-sm"
          numberOfLines={1}
          style={{
            fontFamily: "Poppins-Regular, OpenMoji-Color",
          }}
        >
          GIF
        </AppText>
      </View>
    );
  }

  if (amISentTheMessage && lastMessage.messageType !== MessageTypeEnum.SYSTEM_EVENT) {
    return `${prefix} ${lastMessage.messageText}`;
  }

  if (isGroup && lastMessage.messageType !== MessageTypeEnum.SYSTEM_EVENT) {
    return `${lastMessage.senderFirstName}: ${lastMessage.messageText}`;
  }

  return lastMessage.messageText;
};

const styles = StyleSheet.create({
  attachmentIcon: {
    transform: [{ rotate: "-45deg" }],
  },
});
