import { View } from "react-native";
import { AppText } from "@/components/AppText";
import React from "react";

export const DateSection = ({ title }: { title: string }) => (
  <View className="items-center my-2">
    <View className="dark:bg-secondary-dark bg-secondary-light rounded-full px-3 py-1">
      <AppText className="text-xs dark:!text-gray-300 text-gray-700 font-medium">{title}</AppText>
    </View>
  </View>
);
