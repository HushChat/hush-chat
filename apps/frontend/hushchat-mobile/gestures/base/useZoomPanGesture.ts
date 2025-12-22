import { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useCallback, useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import { usePanGesture } from "@/gestures/base/usePanGesture";
import { useDoubleTapGesture } from "@/gestures/base/useDoubleTapGesture";

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
};

const ZOOM_LIMITS = {
  MIN: 1,
  MAX: 4,
  THRESHOLD: 1.1,
  DOUBLE_TAP: 2,
};

export const useZoomPanGestures = (isEnabled: boolean) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const isZoomed = useSharedValue(false);

  const resetTransform = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    savedScale.value = 1;
    isZoomed.value = false;
  }, [scale, translateX, translateY, savedScale, isZoomed]);

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .enabled(isEnabled)
        .onStart(() => {
          savedScale.value = scale.value;
        })
        .onUpdate((event) => {
          const newScale = savedScale.value * event.scale;
          scale.value = Math.min(Math.max(newScale, ZOOM_LIMITS.MIN), ZOOM_LIMITS.MAX);
          isZoomed.value = scale.value > ZOOM_LIMITS.THRESHOLD;
        })
        .onEnd(() => {
          if (scale.value < ZOOM_LIMITS.MIN) {
            scale.value = withSpring(1, SPRING_CONFIG);
            translateX.value = withSpring(0, SPRING_CONFIG);
            translateY.value = withSpring(0, SPRING_CONFIG);
            savedScale.value = 1;
            isZoomed.value = false;
          } else {
            savedScale.value = scale.value;
          }
        }),
    [isEnabled, scale, savedScale, translateX, translateY, isZoomed]
  );

  const { gesture: panGesture } = usePanGesture({
    enabled: isEnabled,
    axis: "free",
    onUpdate: ({ translationX: tx, translationY: ty }) => {
      if (scale.value > 1) {
        translateX.value = tx;
        translateY.value = ty;
      }
    },
    onEnd: () => {
      if (scale.value <= 1) {
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    },
  });

  const { gesture: doubleTapGesture } = useDoubleTapGesture({
    enabled: isEnabled,
    onEnd: () => {
      if (scale.value > 1) {
        scale.value = withSpring(1, SPRING_CONFIG);
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        savedScale.value = 1;
        isZoomed.value = false;
      } else {
        scale.value = withSpring(ZOOM_LIMITS.DOUBLE_TAP, SPRING_CONFIG);
        savedScale.value = ZOOM_LIMITS.DOUBLE_TAP;
        isZoomed.value = true;
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return {
    scale,
    isZoomed,
    resetTransform,
    pinchGesture,
    panGesture,
    doubleTapGesture,
    animatedStyle,
  };
};
