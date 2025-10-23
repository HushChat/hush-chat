import React from 'react';
import { View, Text } from 'react-native';

const EmptyChatState = () => {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-4xl mb-4">💬</Text>
      <Text className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
        No messages yet
      </Text>
      <Text className="text-gray-600 dark:text-text-secondary-dark text-center">
        Start the conversation by sending a message
      </Text>
    </View>
  );
};

export default EmptyChatState;
