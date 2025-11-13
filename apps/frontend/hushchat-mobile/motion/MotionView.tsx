import React from "react";
import Animated from "react-native-reanimated";
import { IMotionOptions } from "@/motion/types";
import { useMotion } from "@/motion/useMotion";

interface MotionViewProps extends IMotionOptions {
  visible: boolean;
  style?: any;
  children?: React.ReactNode;
  pointerEvents?: "box-none" | "none" | "box-only" | "auto";
  className?: string;
}

export const MotionView = ({
  visible,
  style,
  children,
  pointerEvents = "auto",
  className,
  ...opts
}: MotionViewProps) => {
  const { style: motionStyle } = useMotion(visible, opts);

  return (
    <Animated.View pointerEvents={pointerEvents} style={[motionStyle, style]} className={className}>
      {children}
    </Animated.View>
  );
};
