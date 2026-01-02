import { View } from "react-native";
import { AppText } from "@/components/AppText";
import React from "react";

interface UnreadMessageSectionProps {
  count: number;
}

export const UnreadMessageSection = ({ count }: UnreadMessageSectionProps) => (
  <View className="items-center my-3">
    <View className="flex-row items-center w-full px-4">
      <View className="flex-1 h-[1px] bg-gray-500" />
      <View className="dark:bg-secondary-dark bg-secondary-light rounded-full px-3 py-1">
        <AppText className="text-xs dark:!text-gray-300 text-gray-700 font-medium">
          {/* Update the text to include the count */}
          Newer Messages ({count})
        </AppText>
      </View>
      <View className="flex-1 h-[1px] bg-gray-500" />
    </View>
  </View>
);
