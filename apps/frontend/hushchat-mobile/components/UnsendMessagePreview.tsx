import { IMessage } from "@/types/chat/types";
import { useColorScheme, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { useUserStore } from "@/store/user/useUserStore";
import { AppText } from "@/components/AppText";

interface UnsendMessagePreviewProps {
  unsendMessage?: IMessage;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 4,
  },
  unsendText: {
    marginLeft: 4,
    fontStyle: "italic",
  },
});

export default function UnsendMessagePreview({ unsendMessage }: UnsendMessagePreviewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useUserStore();

  const getDeleteText = useCallback(() => {
    if (!unsendMessage) return "";

    const currentUserId = Number(user.id);
    const senderId = unsendMessage.senderId;
    const deleter = unsendMessage.unsentBy;

    const isAdminDelete = deleter && deleter.id !== senderId;

    if (isAdminDelete) {
      if (deleter.id === currentUserId) {
        return "You deleted this message as admin";
      }
      return `This message was deleted by admin ${deleter.firstName}`;
    }

    if (senderId === currentUserId) {
      return "You deleted this message";
    }

    return `${unsendMessage.senderFirstName} deleted this message`;
  }, [unsendMessage]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper} className="bg-background-light dark:bg-background-dark">
        <MaterialIcons name="block" size={14} color={isDark ? "#9ca3af" : "#111827"} />
      </View>
      <AppText
        className="text-text-primary-light dark:text-text-secondary-dark pb-1"
        style={styles.unsendText}
      >
        {getDeleteText()}
      </AppText>
    </View>
  );
}
