import { IMessage } from "@/types/chat/types";
import { Text, useColorScheme, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { useUserStore } from "@/store/user/useUserStore";

interface UnsendMessagePreviewProps {
  unsendMessage?: IMessage;
}

export default function UnsendMessagePreview({
  unsendMessage,
}: UnsendMessagePreviewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useUserStore();

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View
        style={{
          backgroundColor: "bg-background-light dark:bg-background-dark",
          padding: 4,
          borderRadius: 4,
        }}
      >
        <MaterialIcons
          name="block"
          size={14}
          color={isDark ? "#9ca3af" : "#111827"}
        />
      </View>
      <Text
        className="text-text-primary-light dark:text-text-secondary-dark pb-1"
        style={{ marginLeft: 4, fontStyle: "italic" }}
      >
        {unsendMessage?.senderId !== Number(user.id)
          ? unsendMessage?.senderFirstName
          : "You"}{" "}
        unsent this message
      </Text>
    </View>
  );
}
