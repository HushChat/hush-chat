import { PLATFORM } from "@/constants/platformConstants";
import React, { useEffect } from "react";
import { View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

const HIGHLIGHT_CONFIG = {
  STAY_DURATION: 2000,
  FADE_OUT_DURATION: 500,
  MAX_OPACITY: 0.35,
} as const;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface IHighlightWrapperProps {
  shouldHighlight: boolean;
  children: React.ReactNode;
}

export const MessageHighlightWrapper: React.FC<IHighlightWrapperProps> = ({
  shouldHighlight,
  children,
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!shouldHighlight) {
      return;
    }

    cancelAnimation(opacity);
    opacity.value = withSequence(
      withTiming(HIGHLIGHT_CONFIG.MAX_OPACITY, { duration: 100 }),
      withDelay(
        HIGHLIGHT_CONFIG.STAY_DURATION,
        withTiming(0, { duration: HIGHLIGHT_CONFIG.FADE_OUT_DURATION })
      )
    );
  }, [shouldHighlight]);

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  if (PLATFORM.IS_WEB) {
    return (
      <View className="relative">
        <Animated.View
          className="absolute inset-y-0 -z-10 bg-primary-light dark:bg-primary-dark"
          style={[
            {
              // left: -120,
              // right: -12,
              left: "auto",
              right: "auto",
              width: "100vw" as any,
              top: -8,
              bottom: -8,
            },
            overlayAnimatedStyle,
          ]}
          pointerEvents="none"
        />
        {children}
      </View>
    );
  }

  return (
    <View className="relative">
      <Animated.View
        className="absolute -top-2 -bottom-2 -z-10 bg-primary-light dark:bg-primary-dark"
        style={[
          {
            left: -SCREEN_WIDTH,
            right: -SCREEN_WIDTH,
          },
          overlayAnimatedStyle,
        ]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
};
