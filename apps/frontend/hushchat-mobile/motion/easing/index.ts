import { Easing } from "react-native-reanimated";

export const MotionEasing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  emphasized: Easing.bezier(0.05, 0.7, 0.1, 1),
  decelerate: Easing.out(Easing.cubic),
  accelerate: Easing.in(Easing.cubic),
  linear: Easing.linear,
  springy: Easing.bezier(0.25, 1.5, 0.35, 1),
  snappy: Easing.bezier(0.4, 0, 0.2, 1),

  pair: {
    enter: Easing.out(Easing.cubic),
    exit: Easing.in(Easing.cubic),
  },
};

export type TMotionEasingName = keyof typeof MotionEasing;
