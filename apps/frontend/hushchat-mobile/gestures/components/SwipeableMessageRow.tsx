import React, { ReactNode, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSwipeGesture } from "@/gestures/base/useSwipeGesture";
import { useLongPressGesture } from "@/gestures/base/useLongPressGesture";

type TSwipeableMessageRowProps = {
  children: ReactNode;
  trigger?: number;
  maxDrag?: number;
  onReply?: () => void;
  onLongPress?: () => void;
  enabled?: boolean;
  showAffordance?: boolean;
};

export function SwipeableMessageRow({
  children,
  trigger = 42,
  maxDrag = 80,
  onReply,
  onLongPress,
  enabled = true,
  showAffordance = true,
}: TSwipeableMessageRowProps) {
  const {
    gesture: swipeGesture,
    translateX,
    progress,
  } = useSwipeGesture({
    enabled,
    direction: "horizontal",
    trigger,
    maxDrag,
    allowLeft: false,
    allowRight: true,
    onSwipeRight: () => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onReply?.();
    },
  });

  const { gesture: longPressGesture } = useLongPressGesture({
    enabled,
    minDurationMs: 250,
    onStart: () => {
      if (onLongPress) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onLongPress();
      }
    },
  });

  const composedGesture = useMemo(
    () => Gesture.Simultaneous(swipeGesture, longPressGesture),
    [swipeGesture, longPressGesture]
  );

  const swipeGroupStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const affordanceStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.8 + 0.2 * progress.value }],
  }));

  return (
    <GestureDetector gesture={composedGesture}>
      <View className="relative">
        {showAffordance && (
          <Animated.View style={[styles.affordanceIcon, affordanceStyle]}>
            <Ionicons name="arrow-undo-outline" size={20} color="#9CA3AF" />
          </Animated.View>
        )}
        <Animated.View style={swipeGroupStyle}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  affordanceIcon: {
    position: "absolute",
    top: 10,
    left: 8,
    pointerEvents: "none",
  },
});
