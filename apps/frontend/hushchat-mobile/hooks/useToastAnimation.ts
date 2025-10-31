import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { usePanGesture } from "@/gestures/base/usePanGesture";
import Toast from "react-native-toast-message";

export const TOAST_POSITION = {
  TOP: "top",
  BOTTOM: "bottom",
} as const;

export type ToastPosition =
  (typeof TOAST_POSITION)[keyof typeof TOAST_POSITION];

export const useToastAnimation = (
  position: ToastPosition,
  title?: string,
  message?: string,
  isVisible?: boolean,
) => {
  const isTop = position === TOAST_POSITION.TOP;
  const translateY = useSharedValue(isTop ? -100 : 100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = isTop ? -100 : 100;
      opacity.value = 0;
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, isTop]);

  const hideToast = () => Toast.hide();

  const { gesture } = usePanGesture({
    axis: "vertical",
    offsets: {
      activeY: [-1, 1],
      failX: [-30, 30],
    },
    onUpdate: (event) => {
      const translation = event.translationY;

      if (isTop && translation <= 0) {
        translateY.value = translation;
        opacity.value = Math.max(0, 1 + translation / 100);
      } else if (!isTop && translation >= 0) {
        translateY.value = translation;
        opacity.value = Math.max(0, 1 - translation / 100);
      }
    },
    onEnd: (event) => {
      const threshold = isTop ? -50 : 50;
      const exitValue = isTop ? -200 : 200;

      if (
        isTop ? event.translationY < threshold : event.translationY > threshold
      ) {
        scheduleOnRN(hideToast);
        translateY.value = withTiming(exitValue, { duration: 150 });
        opacity.value = withTiming(0, { duration: 150 });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
        opacity.value = withTiming(1, { duration: 200 });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return { gesture, animatedStyle };
};
