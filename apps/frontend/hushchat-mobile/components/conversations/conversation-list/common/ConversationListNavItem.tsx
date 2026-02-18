/**
 * ConversationListNavItem
 *
 * A single navigational row inside the conversations list (e.g., "Archived").
 */
import { View, useColorScheme } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ListItem } from "@/components/ui/ListItem";
import { Divider } from "@/components/ui/Divider";

interface ChatListOptionProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  action: () => void;
}

const ConversationListNavItem = ({ title, iconName, action }: ChatListOptionProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  return (
    <View className="bg-background-light dark:bg-background-dark">
      <ListItem
        leading={
          <View className="w-6 h-6 items-center justify-center">
            <Ionicons name={iconName} size={22} color={isDark ? "#ffffff" : "#000000"} />
          </View>
        }
        title={title}
        onPress={action}
      />
      <Divider indent={58} />
    </View>
  );
};

export default ConversationListNavItem;
