import {
  withTiming,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { usePanGesture } from "./usePanGesture";
import { PLATFORM } from "@/constants/platformConstants";
import { OffsetThresholds, VelocityThresholds } from "@/types/gestures/types";

type Direction = "horizontal" | "vertical";

type SwipeGestureProps = {
  enabled?: boolean;
  direction?: Direction;
  trigger?: number;
  maxDrag?: number;
  leftTrigger?: number;
  rightTrigger?: number;
  maxDragLeft?: number;
  maxDragRight?: number;
  velocity?: VelocityThresholds;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  allowLeft?: boolean;
  allowRight?: boolean;
  shouldReset?: boolean;
  offsets?: OffsetThresholds;
};

type SwipeGestureResult = {
  gesture: ReturnType<typeof usePanGesture>["gesture"];
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  progress: SharedValue<number>;
};

export function useSwipeGesture({
  enabled = true,
  direction = "horizontal",
  trigger = 42,
  maxDrag = 80,
  velocity = { horizontal: 900, vertical: 900 },
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  allowLeft = true,
  allowRight = true,
  shouldReset = true,
  maxDragLeft,
  maxDragRight,
  offsets,
}: SwipeGestureProps): SwipeGestureResult {
  const progress = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const horizontalOffsets: OffsetThresholds = {
    activeX: [-12, 12],
    activeY: [-12, 12],
    failX: [-9999, 9999],
    failY: [-8, 8],
  };

  const verticalOffsets: OffsetThresholds = {
    activeX: [-12, 12],
    activeY: [-12, 12],
    failX: [-8, 8],
    failY: [-9999, 9999],
  };

  const { gesture } = usePanGesture({
    enabled,
    axis: direction === "horizontal" ? "horizontal" : "vertical",
    offsets:
      offsets ??
      (direction === "horizontal" ? horizontalOffsets : verticalOffsets),
    callbacksRunOnJS: PLATFORM.IS_WEB,

    onUpdate: ({ translationX, translationY }) => {
      if (direction === "horizontal") {
        const leftLimit = maxDragLeft ?? maxDrag;
        const rightLimit = maxDragRight ?? maxDrag;

        const minX = allowLeft ? -leftLimit : 0;
        const maxX = allowRight ? rightLimit : 0;

        const x = Math.max(Math.min(translationX, maxX), minX);
        translateX.value = x;

        const p =
          allowLeft && allowRight
            ? Math.abs(x)
            : allowRight
              ? Math.max(0, x)
              : Math.max(0, -x);
        progress.value = Math.min(p / trigger, 1);
      } else {
        const y = Math.max(Math.min(translationY, maxDrag), -maxDrag);
        translateY.value = y;
        progress.value = Math.min(Math.abs(y) / trigger, 1);
      }
    },

    onEnd: ({ translationX, translationY, velocityX, velocityY }) => {
      if (direction === "horizontal") {
        const vThresh = velocity.horizontal ?? 900;
        if (allowRight && (translationX >= trigger || velocityX > vThresh)) {
          onSwipeRight?.();
          if (!shouldReset) return;
        }
        if (allowLeft && (translationX <= -trigger || velocityX < -vThresh)) {
          onSwipeLeft?.();
          if (!shouldReset) return;
        }
      } else {
        const vThresh = velocity.vertical ?? 900;
        if (translationY >= trigger || velocityY > vThresh) onSwipeDown?.();
        else if (translationY <= -trigger || velocityY < -vThresh)
          onSwipeUp?.();
      }

      translateX.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(0, { duration: 150 });
      progress.value = withTiming(0, { duration: 150 });
    },
  });

  return { gesture, translateX, translateY, progress };
}
