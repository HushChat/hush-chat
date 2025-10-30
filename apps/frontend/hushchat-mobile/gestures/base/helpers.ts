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

import { Gesture } from "react-native-gesture-handler";
import { ExternalGestures } from "@/types/gestures/types";

/**
 * Binds gesture exclusivity rules:
 * - simultaneous gestures (can run together)
 * - required-to-fail gestures (must fail before this one activates)
 */
export function bindExclusivity<
  T extends
    | ReturnType<typeof Gesture.Tap>
    | ReturnType<typeof Gesture.LongPress>
    | ReturnType<typeof Gesture.Pan>
    | ReturnType<typeof Gesture.Pinch>
    | ReturnType<typeof Gesture.Rotation>,
>(
  gesture: T,
  simultaneousGestures?: ExternalGestures,
  requiredToFailGestures?: ExternalGestures,
) {
  const simultaneousList = Array.isArray(simultaneousGestures)
    ? simultaneousGestures
    : simultaneousGestures
      ? [simultaneousGestures]
      : [];

  const requiredToFailList = Array.isArray(requiredToFailGestures)
    ? requiredToFailGestures
    : requiredToFailGestures
      ? [requiredToFailGestures]
      : [];

  simultaneousList.forEach((externalGesture) =>
    gesture.simultaneousWithExternalGesture(externalGesture),
  );

  requiredToFailList.forEach((externalGesture) =>
    gesture.requireExternalGestureToFail(externalGesture),
  );

  return gesture;
}
