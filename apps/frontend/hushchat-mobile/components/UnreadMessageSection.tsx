import { View } from "react-native";
import { AppText } from "@/components/AppText";
import React from "react";

export const UnreadMessageSection = () => (
  <View className="items-center my-3">
    <View className="flex-row items-center w-full px-4">
      <View className="flex-1 h-[1px] bg-red-500" />
      <View className="bg-red-500 rounded-full px-4 py-1.5 mx-3">
        <AppText className="text-xs text-white font-semibold">Newer Messages</AppText>
      </View>
      <View className="flex-1 h-[1px] bg-red-500" />
    </View>
  </View>
);
