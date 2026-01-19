import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import LastMessagePreview from "@/components/UnsendMessagePreview";
import { type IMessage, MessageTypeEnum } from "@/types/chat/types";
import { hasGif } from "@/utils/messageUtils";
import { useUserStore } from "@/store/user/useUserStore";

interface LastMessagePreviewContentProps {
  lastMessage: IMessage | undefined;
  isGroup: boolean;
}

export const LastMessagePreviewContent = ({
  lastMessage,
  isGroup,
}: LastMessagePreviewContentProps) => {
  const { user } = useUserStore();

  if (!lastMessage) return "No Messages Yet";
  const isGif = hasGif(lastMessage);

  if (!lastMessage.isUnsend && lastMessage.hasAttachment && !isGif) {
    return (
      <View className="flex-row items-center gap-1">
        <View style={styles.attachmentIcon}>
          <MaterialIcons name="attachment" size={14} color="#6B7280" />
        </View>
        <AppText className="text-gray-600 dark:text-text-secondary-dark text-sm">
          Attachment
        </AppText>
      </View>
    );
  }

  if (lastMessage.isUnsend) {
    return <LastMessagePreview unsendMessage={lastMessage} />;
  }

  if (isGroup && lastMessage.messageType !== MessageTypeEnum.SYSTEM_EVENT) {
    const senderName =
      user?.id && lastMessage.senderId === user.id ? "You" : lastMessage.senderFirstName;
    return `${senderName}: ${lastMessage.messageText}`;
  }

  return lastMessage.messageText;
};

const styles = StyleSheet.create({
  attachmentIcon: {
    transform: [{ rotate: "-45deg" }],
  },
});
