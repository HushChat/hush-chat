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

import React from "react";
import { ImageProps } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { usePinchGesture } from "@/gestures/base/usePinchGesture";
import { usePanGesture } from "@/gestures/base/usePanGesture";
import { useDoubleTapGesture } from "@/gestures/base/useDoubleTapGesture";

type TZoomableImageProps = {
  source: ImageProps["source"];
  doubleTapScale?: number;
  onZoom?: (scale: number) => void;
  className?: string;
};

export function ZoomableImage({
  source,
  doubleTapScale = 2,
  onZoom,
  className,
}: TZoomableImageProps) {
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const { gesture: pinch } = usePinchGesture({
    minScale: 1,
    maxScale: 3,
    onChange: (s) => {
      scale.value = s;
      onZoom?.(s);
    },
  });

  const { gesture: pan } = usePanGesture({
    axis: "free",
    onUpdate: ({ translationX, translationY }) => {
      tx.value = translationX;
      ty.value = translationY;
    },
    onEnd: () => {
      if (scale.value <= 1.01) {
        tx.value = withTiming(0);
        ty.value = withTiming(0);
      }
    },
  });

  const { gesture: doubleTap } = useDoubleTapGesture({
    onEnd: () => {
      const target = scale.value > 1 ? 1 : doubleTapScale;
      scale.value = withTiming(target, { duration: 150 });
      if (target === 1) {
        tx.value = withTiming(0);
        ty.value = withTiming(0);
      }
      onZoom?.(target);
    },
  });

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View>
        <Animated.Image
          source={source}
          style={[{ width: "100%", height: "100%" }, style]}
          className={className}
        />
      </Animated.View>
    </GestureDetector>
  );
}
