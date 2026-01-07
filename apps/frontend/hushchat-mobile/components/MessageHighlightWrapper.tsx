import { PLATFORM } from "@/constants/platformConstants";
import React, { useEffect } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
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

const DEFAULT_HIGHLIGHT_COLOR = "#563dc4";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface IHighlightWrapperProps {
  isHighlighted: boolean;
  children: React.ReactNode;
  highlightColor?: string;
}

export const MessageHighlightWrapper: React.FC<IHighlightWrapperProps> = ({
  isHighlighted,
  children,
  highlightColor = DEFAULT_HIGHLIGHT_COLOR,
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isHighlighted) {
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
  }, [isHighlighted]);

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  if (PLATFORM.IS_WEB) {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.highlightOverlay,
            {
              backgroundColor: highlightColor,
              left: -120,
              right: -12,
              width: "100vw" as any,
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
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.highlightOverlay,
          {
            backgroundColor: highlightColor,
            position: "absolute",
            top: -8,
            bottom: -8,
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

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  highlightOverlay: {
    position: "absolute",
    top: -8,
    bottom: -8,
    borderRadius: 0,
    zIndex: -1,
  },
});
