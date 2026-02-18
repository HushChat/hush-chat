import React, { useEffect } from "react";
import { View } from "react-native";
import classNames from "classnames";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export const Skeleton = ({
  width = "100%",
  height = 16,
  borderRadius = 8,
  className,
}: SkeletonProps) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius }, animatedStyle]}
      className={classNames("bg-gray-200 dark:bg-gray-700", className)}
    />
  );
};

export const ConversationListSkeleton = () => (
  <View className="px-4">
    {[...Array(8)].map((_, i) => (
      <View key={i} className="flex-row items-center gap-3 py-3">
        <Skeleton width={48} height={48} borderRadius={24} />
        <View className="flex-1 gap-2">
          <View className="flex-row items-center justify-between">
            <Skeleton width="60%" height={14} />
            <Skeleton width={40} height={12} />
          </View>
          <Skeleton width="80%" height={12} />
        </View>
      </View>
    ))}
  </View>
);

export const MessageListSkeleton = () => (
  <View className="px-4 py-2">
    {[...Array(6)].map((_, i) => {
      const isRight = i % 3 === 0;
      return (
        <View key={i} className={classNames("mb-4", isRight ? "items-end" : "items-start")}>
          <Skeleton width={isRight ? 200 : 240} height={isRight ? 48 : 60} borderRadius={16} />
        </View>
      );
    })}
  </View>
);

export const ProfileSkeleton = () => (
  <View className="items-center py-8 gap-4">
    <Skeleton width={120} height={120} borderRadius={60} />
    <Skeleton width={160} height={20} />
    <Skeleton width={120} height={14} />
  </View>
);
