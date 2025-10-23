import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

type ErrorViewProps = {
  title: string;
  message: string;
  onBack?: () => void;
  onRetry?: () => void;
  imageSource?: ImageSourcePropType;
};

const ErrorView = ({ title, message, onBack, onRetry, imageSource }: ErrorViewProps) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark border-l border-gray-200 dark:border-gray-800"
      style={{ paddingTop: insets.top + 4 }}
    >
      <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-800">
        {onBack && (
          <TouchableOpacity onPress={onBack} className="mr-4" hitSlop={8}>
            <Ionicons
              name="arrow-back"
              size={20}
              className="text-!text-primary-light dark:!text-text-primary-dark"
            />
          </TouchableOpacity>
        )}
        <Text className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
          {title}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-4">
        {imageSource ? (
          <Image source={imageSource} resizeMode="contain" style={{ width: 228, height: 228 }} />
        ) : (
          <Ionicons name="chatbubbles-outline" size={80} color="#9CA3AF" />
        )}
        <Text className="text-xl font-semibold mt-4 text-text-primary-light dark:text-text-primary-dark">
          {title} Not Found
        </Text>
        <Text className="text-center mt-2 text-text-secondary-light dark:text-text-secondary-dark">
          {message}
        </Text>

        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            className="mt-6 bg-primary-light dark:bg-primary-dark px-6 py-3 rounded-lg"
          >
            <Text className="text-text-primary-dark font-semibold">Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ErrorView;
