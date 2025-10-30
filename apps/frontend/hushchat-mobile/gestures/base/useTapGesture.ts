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
import { bindExclusivity } from "./helpers";
import { ExternalGestures } from "@/types/gestures/types";

type TTapGestureProps = {
  enabled?: boolean;
  numberOfTaps?: number;
  onStart?: () => void;
  onEnd?: () => void;
  simultaneousWith?: ExternalGestures;
  requireToFail?: ExternalGestures;
};

export function useTapGesture({
  enabled = true,
  numberOfTaps = 1,
  onStart,
  onEnd,
  simultaneousWith,
  requireToFail,
}: TTapGestureProps) {
  const gesture = useMemo(() => {
    const g = Gesture.Tap().enabled(enabled).numberOfTaps(numberOfTaps);

    if (onStart) g.onStart(onStart);
    if (onEnd) g.onEnd(onEnd);

    return bindExclusivity(g, simultaneousWith, requireToFail);
  }, [enabled, numberOfTaps, onStart, onEnd, simultaneousWith, requireToFail]);

  return { gesture };
}
