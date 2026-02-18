import { AppText } from "@/components/AppText";
import { MotionView } from "@/motion/MotionView";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

const EmptyChatState = () => {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <MotionView visible={true} preset="slideUp">
        <View className="items-center">
          <View className="w-16 h-16 rounded-full bg-primary-light/10 dark:bg-primary-dark/20 items-center justify-center mb-4">
            <Ionicons name="chatbubbles-outline" size={32} color="#6B4EFF" />
          </View>
          <AppText className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            No messages yet
          </AppText>
          <AppText className="text-gray-600 dark:text-text-secondary-dark text-center">
            Start the conversation by sending a message
          </AppText>
        </View>
      </MotionView>
    </View>
  );
};

export default EmptyChatState;
