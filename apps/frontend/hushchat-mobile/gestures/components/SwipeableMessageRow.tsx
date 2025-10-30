/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { ReactNode, useMemo } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  Extrapolation,
} from "react-native-reanimated";
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
    [swipeGesture, longPressGesture],
  );

  const swipeGroupStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.8, 1],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ scale }] };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <View className="relative">
        {showAffordance && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 10,
                left: 8,
                pointerEvents: "none",
              },
              iconStyle,
            ]}
          >
            <Ionicons name="arrow-undo-outline" size={20} color="#9CA3AF" />
          </Animated.View>
        )}
        <Animated.View style={swipeGroupStyle}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}
