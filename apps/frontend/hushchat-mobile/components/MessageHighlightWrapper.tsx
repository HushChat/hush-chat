import { PLATFORM } from "@/constants/platformConstants";
import React, { useEffect } from "react";
import { ViewStyle } from "react-native";
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

interface IHighlightWrapperProps {
  id: number | string;
  targetId?: number | string | null;
  children: React.ReactNode;
  style?: ViewStyle;
  onHighlightComplete?: () => void;
  initialDelay?: number;
  glowColor?: string;
  pulseCount?: number;
}

export const MessageHighlightWrapper: React.FC<IHighlightWrapperProps> = ({
  id,
  targetId,
  children,
  style,
  onHighlightComplete,
  initialDelay = 300,
  glowColor = "#3B82F6",
  pulseCount = 2,
}) => {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (id !== targetId) {
      cancelAnimation(progress);
      cancelAnimation(scale);
      progress.value = 0;
      scale.value = 1;
      return;
    }

    if (id === targetId) {
      progress.value = withDelay(
        initialDelay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          pulseCount,
          false
        )
      );

      scale.value = withDelay(
        initialDelay,
        withSequence(
          withTiming(1.05, { duration: 200, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) })
        )
      );
    }
  }, [id, targetId, initialDelay, pulseCount, onHighlightComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(progress.value, [0, 1], [0, 0.8]);
    const shadowRadius = interpolate(progress.value, [0, 1], [0, 15]);
    const elevation = interpolate(progress.value, [0, 1], [0, 10]);

    const webBoxShadow = PLATFORM.IS_WEB
      ? `0px 0px ${interpolate(progress.value, [0, 1], [0, 20])}px ${glowColor}`
      : undefined;

    return {
      transform: [{ scale: scale.value }],
      shadowColor: glowColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity,
      shadowRadius,
      elevation,
      ...(PLATFORM.IS_WEB && {
        boxShadow: webBoxShadow,
      }),
    };
  });

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};
