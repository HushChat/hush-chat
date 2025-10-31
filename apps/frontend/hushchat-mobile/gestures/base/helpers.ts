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
>(gesture: T, simultaneousGestures?: ExternalGestures, requiredToFailGestures?: ExternalGestures) {
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
    gesture.simultaneousWithExternalGesture(externalGesture)
  );

  requiredToFailList.forEach((externalGesture) =>
    gesture.requireExternalGestureToFail(externalGesture)
  );

  return gesture;
}
