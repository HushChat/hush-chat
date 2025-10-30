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
import { scheduleOnRN } from "react-native-worklets";
import { bindExclusivity } from "./helpers";
import { PLATFORM } from "@/constants/platformConstants";
import {
  Axis,
  ExternalGestures,
  OffsetThresholds,
} from "@/types/gestures/types";

type PanEvent = {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
};

type TPanGestureProps = {
  enabled?: boolean;
  axis?: Axis;
  offsets?: OffsetThresholds;
  onBegin?: () => void;
  onUpdate?: (event: PanEvent) => void;
  onEnd?: (event: PanEvent) => void;
  simultaneousWith?: ExternalGestures;
  requireToFail?: ExternalGestures;
  callbacksRunOnJS?: boolean;
};

const DEFAULT_OFFSETS: OffsetThresholds = {
  activeX: [-12, 12],
  activeY: [-12, 12],
  failX: [-8, 8],
  failY: [-8, 8],
};

export function usePanGesture({
  enabled = true,
  axis = "free",
  offsets = DEFAULT_OFFSETS,
  onBegin,
  onUpdate,
  onEnd,
  simultaneousWith,
  requireToFail,
  callbacksRunOnJS = PLATFORM.IS_WEB,
}: TPanGestureProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const velocityX = useSharedValue(0);
  const velocityY = useSharedValue(0);

  const gesture = useMemo(() => {
    const g = Gesture.Pan().enabled(enabled);

    // keep web on JS; native runs on UI
    if (callbacksRunOnJS) g.runOnJS(true);

    if (axis === "horizontal") {
      g.activeOffsetX(
        (offsets.activeX ?? DEFAULT_OFFSETS.activeX) as
          | [number, number]
          | number,
      );
      g.failOffsetY(
        (offsets.failY ?? DEFAULT_OFFSETS.failY) as [number, number] | number,
      );
    } else if (axis === "vertical") {
      g.activeOffsetY(
        (offsets.activeY ?? DEFAULT_OFFSETS.activeY) as
          | [number, number]
          | number,
      );
      g.failOffsetX(
        (offsets.failX ?? DEFAULT_OFFSETS.failX) as [number, number] | number,
      );
    } else {
      g.activeOffsetX(
        (offsets.activeX ?? DEFAULT_OFFSETS.activeX) as
          | [number, number]
          | number,
      );
      g.activeOffsetY(
        (offsets.activeY ?? DEFAULT_OFFSETS.activeY) as
          | [number, number]
          | number,
      );
    }

    if ((g as any).enableTrackpadTwoFingerGesture) {
      (g as any).enableTrackpadTwoFingerGesture(true);
    }

    g.onBegin(() => {
      "worklet";
      if (onBegin) scheduleOnRN(onBegin);
    });

    g.onUpdate((e) => {
      "worklet";
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      velocityX.value = e.velocityX;
      velocityY.value = e.velocityY;
      if (onUpdate) {
        scheduleOnRN(onUpdate, {
          translationX: e.translationX,
          translationY: e.translationY,
          velocityX: e.velocityX,
          velocityY: e.velocityY,
        } as PanEvent);
      }
    });

    g.onEnd((e) => {
      "worklet";
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      velocityX.value = e.velocityX;
      velocityY.value = e.velocityY;
      if (onEnd) {
        scheduleOnRN(onEnd, {
          translationX: e.translationX,
          translationY: e.translationY,
          velocityX: e.velocityX,
          velocityY: e.velocityY,
        } as PanEvent);
      }
    });

    return bindExclusivity(g, simultaneousWith, requireToFail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    axis,
    offsets,
    onBegin,
    onUpdate,
    onEnd,
    simultaneousWith,
    requireToFail,
    callbacksRunOnJS,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return {
    gesture,
    animatedStyle,
    translateX,
    translateY,
    velocityX,
    velocityY,
  };
}
