import React, { ReactNode } from "react";
import { View, ActivityIndicator } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSwipeGesture } from "@/gestures/base/useSwipeGesture";

type TPullToRefreshListProps = {
  children: ReactNode;
  onRefresh: () => void;
  refreshing?: boolean;
  trigger?: number;
  maxDrag?: number;
};

export function PullToRefreshList({
  children,
  onRefresh,
  refreshing = false,
  trigger = 60,
  maxDrag = 80,
}: TPullToRefreshListProps) {
  const { gesture, translateY, progress } = useSwipeGesture({
    direction: "vertical",
    trigger,
    maxDrag,
    onSwipeDown: () => onRefresh(),
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: withTiming(refreshing ? 40 : Math.min(40, progress.value * 40), {
      duration: 100,
    }),
    opacity: progress.value,
  }));

  const groupStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(0, translateY.value) }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View className="flex-1">
        <Animated.View
          style={headerStyle}
          className="items-center justify-center"
        >
          {refreshing ? <ActivityIndicator /> : null}
        </Animated.View>
        <Animated.View style={groupStyle}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}
