import React from "react";
import Animated, { AnimatedProps } from "react-native-reanimated";
import { IMotionOptions } from "@/motion/types";
import { useMotion } from "@/motion/useMotion";
import { ViewProps } from "react-native";

interface MotionViewProps extends IMotionOptions, AnimatedProps<ViewProps> {
  visible: boolean;
  className?: string;
}

export const MotionView = ({
  visible,
  style,
  children,
  pointerEvents = "auto",
  className,
  ...rest
}: MotionViewProps) => {
  const { style: motionStyle } = useMotion(visible, rest);

  return (
    <Animated.View
      pointerEvents={pointerEvents}
      style={[motionStyle, style]}
      className={className}
      {...rest}
    >
      {children}
    </Animated.View>
  );
};
