import { AppText } from "@/components/AppText";
import React from "react";
import { View } from "react-native";

const EmptyChatState = () => {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <AppText className="text-4xl mb-4">💬</AppText>
      <AppText className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
        No messages yet
      </AppText>
      <AppText className="text-gray-600 dark:text-text-secondary-dark text-center">
        Start the conversation by sending a message
      </AppText>
    </View>
  );
};

export default EmptyChatState;
