import React, { ReactNode } from "react";
import { View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSwipeGesture } from "@/gestures/base/useSwipeGesture";
import { scheduleOnRN } from "react-native-worklets";

type TSwipeableCardProps = {
  children: ReactNode;
  width: number;
  onDismissLeft?: () => void;
  onDismissRight?: () => void;
  trigger?: number;
  maxDrag?: number;
};

export function SwipeableCard({
  children,
  width,
  onDismissLeft,
  onDismissRight,
  trigger = 80,
  maxDrag = width * 0.6,
}: TSwipeableCardProps) {
  const { gesture, translateX } = useSwipeGesture({
    direction: "horizontal",
    trigger,
    maxDrag,
    onSwipeLeft: () => {
      if (onDismissLeft) {
        scheduleOnRN(onDismissLeft);
      }
    },
    onSwipeRight: () => {
      if (onDismissRight) {
        scheduleOnRN(onDismissRight);
      }
    },
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={style}>
        <View className="rounded-lg shadow-lg bg-white dark:bg-neutral-800">
          {children}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
