import { IMessage } from "@/types/chat/types";
import { Text, useColorScheme, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useUserStore } from "@/store/user/useUserStore";

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

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper} className="bg-background-light dark:bg-background-dark">
        <MaterialIcons name="block" size={14} color={isDark ? "#9ca3af" : "#111827"} />
      </View>
      <Text
        className="text-text-primary-light dark:text-text-secondary-dark pb-1"
        style={styles.unsendText}
      >
        {unsendMessage?.senderId !== Number(user.id) ? unsendMessage?.senderFirstName : "You"}{" "}
        unsent this message
      </Text>
    </View>
  );
}
