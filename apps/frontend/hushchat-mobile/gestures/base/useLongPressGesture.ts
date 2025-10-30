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
import { scheduleOnRN } from "react-native-worklets";
import { bindExclusivity } from "./helpers";
import { PLATFORM } from "@/constants/platformConstants";
import { ExternalGestures } from "@/types/gestures/types";

type TLongPressGestureProps = {
  enabled?: boolean;
  minDurationMs?: number;
  onStart?: () => void;
  onEnd?: () => void;
  simultaneousWith?: ExternalGestures;
  requireToFail?: ExternalGestures;
};

export function useLongPressGesture({
  enabled = true,
  minDurationMs = 300,
  onStart,
  onEnd,
  simultaneousWith,
  requireToFail,
}: TLongPressGestureProps) {
  const gesture = useMemo(() => {
    const g = Gesture.LongPress().enabled(enabled).minDuration(minDurationMs);

    if (PLATFORM.IS_WEB) g.runOnJS(true);

    g.onStart(() => {
      "worklet";
      if (onStart) scheduleOnRN(onStart);
    });

    g.onEnd(() => {
      "worklet";
      if (onEnd) scheduleOnRN(onEnd);
    });

    return bindExclusivity(g, simultaneousWith, requireToFail);
  }, [enabled, minDurationMs, onStart, onEnd, simultaneousWith, requireToFail]);

  return { gesture };
}
