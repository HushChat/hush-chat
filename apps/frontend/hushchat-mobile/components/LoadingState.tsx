import React from 'react';
import { View, ActivityIndicator } from 'react-native';

const LoadingState = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
  );
};

export default LoadingState;
