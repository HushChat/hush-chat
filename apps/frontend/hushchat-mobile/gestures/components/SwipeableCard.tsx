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
