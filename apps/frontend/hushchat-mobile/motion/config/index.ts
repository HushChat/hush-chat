import { Easing } from "react-native-reanimated";

export const MotionConfig = {
  duration: {
    xs: 120,
    sm: 180,
    md: 250,
    lg: 350,
    xl: 500,
  },
  easing: {
    smooth: Easing.bezier(0.16, 1, 0.3, 1),
    swift: Easing.bezier(0.4, 0, 0.2, 1),
  },
};
