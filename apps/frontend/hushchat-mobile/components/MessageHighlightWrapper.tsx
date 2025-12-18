import { PLATFORM } from "@/constants/platformConstants";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

const HIGHLIGHT_CONFIG = {
  INITIAL_DELAY: 300,
  PULSE_COUNT: 2,
  ANIMATION_DURATION: 400,
  SCALE_AMOUNT: 1.02,
  GLOW_OPACITY: 0.2,
  GLOW_SPREAD: 8,
} as const;

interface IHighlightWrapperProps {
  isHighlighted: boolean;
  children: React.ReactNode;
  glowColor?: string;
}

export const MessageHighlightWrapper: React.FC<IHighlightWrapperProps> = ({
  isHighlighted,
  children,
  glowColor = "#3B82F6",
}) => {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!isHighlighted) {
      cancelAnimation(progress);
      cancelAnimation(scale);
      progress.value = 0;
      scale.value = 1;
      return;
    }

    progress.value = withDelay(
      HIGHLIGHT_CONFIG.INITIAL_DELAY,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: HIGHLIGHT_CONFIG.ANIMATION_DURATION,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: HIGHLIGHT_CONFIG.ANIMATION_DURATION,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        HIGHLIGHT_CONFIG.PULSE_COUNT,
        false
      )
    );

    scale.value = withDelay(
      HIGHLIGHT_CONFIG.INITIAL_DELAY,
      withRepeat(
        withSequence(
          withTiming(HIGHLIGHT_CONFIG.SCALE_AMOUNT, {
            duration: HIGHLIGHT_CONFIG.ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(1, {
            duration: HIGHLIGHT_CONFIG.ANIMATION_DURATION,
            easing: Easing.out(Easing.quad),
          })
        ),
        HIGHLIGHT_CONFIG.PULSE_COUNT,
        false
      )
    );
  }, [isHighlighted]);

  const animatedStyle = useAnimatedStyle(() => {
    if (PLATFORM.IS_WEB) {
      const shadowSize = interpolate(progress.value, [0, 1], [0, 20]);
      return {
        transform: [{ scale: scale.value }],
        boxShadow: `0px 0px ${shadowSize}px ${glowColor}`,
      };
    }

    return {
      transform: [{ scale: scale.value }],
      opacity: interpolate(progress.value, [0, 1], [1, 0.95]),
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    if (PLATFORM.IS_WEB) return {};

    const glowOpacity = interpolate(progress.value, [0, 1], [0, HIGHLIGHT_CONFIG.GLOW_OPACITY]);
    const glowScale = interpolate(progress.value, [0, 1], [0.98, 1.05]);

    return {
      opacity: glowOpacity,
      transform: [{ scale: glowScale }],
    };
  });

  if (!PLATFORM.IS_WEB) {
    return (
      <Animated.View style={{ position: "relative" }}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: -HIGHLIGHT_CONFIG.GLOW_SPREAD,
              left: -HIGHLIGHT_CONFIG.GLOW_SPREAD,
              right: -HIGHLIGHT_CONFIG.GLOW_SPREAD,
              bottom: -HIGHLIGHT_CONFIG.GLOW_SPREAD,
              backgroundColor: glowColor,
              borderRadius: 16,
              zIndex: -1,
            },
            glowStyle,
          ]}
        />
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      </Animated.View>
    );
  }

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};
