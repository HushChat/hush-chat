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

import { useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, useAnimatedStyle } from "react-native-reanimated";
import { bindExclusivity } from "./helpers";
import { ExternalGestures } from "@/types/gestures/types";

type TPinchGestureProps = {
  enabled?: boolean;
  minScale?: number;
  maxScale?: number;
  onChange?: (scale: number) => void;
  simultaneousWith?: ExternalGestures;
  requireToFail?: ExternalGestures;
};

export function usePinchGesture({
  enabled = true,
  minScale = 1,
  maxScale = 3,
  onChange,
  simultaneousWith,
  requireToFail,
}: TPinchGestureProps) {
  const scale = useSharedValue(1);

  const gesture = useMemo(() => {
    const g = Gesture.Pinch()
      .enabled(enabled)
      .onUpdate((e) => {
        const next = Math.max(minScale, Math.min(maxScale, e.scale));
        scale.value = next;
        onChange?.(next);
      })
      .onEnd(() => {
        if (scale.value < minScale) scale.value = minScale;
        if (scale.value > maxScale) scale.value = maxScale;
      });

    return bindExclusivity(g, simultaneousWith, requireToFail);
  }, [
    enabled,
    simultaneousWith,
    requireToFail,
    minScale,
    maxScale,
    scale,
    onChange,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { gesture, scale, animatedStyle };
}
