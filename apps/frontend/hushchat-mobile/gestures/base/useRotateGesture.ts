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

type Props = {
  enabled?: boolean;
  onChange?: (radians: number) => void;
  simultaneousWith?: ExternalGestures;
  requireToFail?: ExternalGestures;
};

export function useRotateGesture({
  enabled = true,
  onChange,
  simultaneousWith,
  requireToFail,
}: Props) {
  const rotation = useSharedValue(0);

  const gesture = useMemo(() => {
    const g = Gesture.Rotation()
      .enabled(enabled)
      .onUpdate((e) => {
        rotation.value = e.rotation;
        onChange?.(rotation.value);
      });

    return bindExclusivity(g, simultaneousWith, requireToFail);
  }, [enabled, simultaneousWith, requireToFail, rotation, onChange]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(rotation.value * 180) / Math.PI}deg` }],
  }));

  return { gesture, rotation, animatedStyle };
}
