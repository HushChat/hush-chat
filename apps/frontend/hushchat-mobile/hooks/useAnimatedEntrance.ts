import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

interface UseAnimatedEntranceOptions {
  slideFromY?: number;
  animateWidth?: boolean;
  duration?: number;
  easing?: (value: number) => number;
}

export const useAnimatedEntrance = ({
  slideFromY = 0,
  animateWidth = false,
  duration = 400,
  easing = Easing.inOut(Easing.cubic),
}: UseAnimatedEntranceOptions = {}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(slideFromY);
  const width = useSharedValue(animateWidth ? 0 : 1);

  const show = (targetWidth?: number): Promise<void> =>
    new Promise((resolve) => {
      opacity.value = withTiming(1, { duration, easing });
      if (slideFromY !== 0) {
        translateY.value = withTiming(0, { duration, easing });
      }
      if (animateWidth && targetWidth != null) {
        width.value = withTiming(targetWidth, { duration, easing });
      }
      setTimeout(() => scheduleOnRN(resolve), duration);
    });

  const hide = () => {
    opacity.value = 0;
    if (slideFromY !== 0) translateY.value = slideFromY;
    if (animateWidth) width.value = 0;
  };

  return {
    opacity,
    translateY,
    width,
    show,
    hide,
  };
};
