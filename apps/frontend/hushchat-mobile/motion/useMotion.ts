import { useEffect, useMemo } from "react";
import { useSharedValue, withTiming, withDelay, useAnimatedStyle } from "react-native-reanimated";
import { IMotionOptions } from "@/motion/types";
import { MotionPresets } from "@/motion/presets";
import { MotionUtils } from "@/motion/utils";

const { mergeMotion, EMPTY_PRESET } = MotionUtils;

export const useMotion = (visible: boolean, opts: IMotionOptions = {}) => {
  const preset = opts.preset ? MotionPresets[opts.preset] : EMPTY_PRESET;
  const final = useMemo(() => mergeMotion(preset, opts, visible), [preset, opts, visible]);

  const delay = opts.delay ?? 0;

  const opacity = useSharedValue(final.initial.opacity);
  const translateY = useSharedValue(final.initial.translateY);
  const translateX = useSharedValue(final.initial.translateX);
  const scale = useSharedValue(final.initial.scale);
  const width = useSharedValue(final.initial.width ?? 0);
  const rotate = useSharedValue(final.initial.rotate ?? 0);

  useEffect(() => {
    const target = visible ? final.animate : final.initial;
    const easing = final.easing;
    const duration = final.duration;

    opacity.value = withDelay(delay, withTiming(target.opacity, { duration, easing }));
    translateY.value = withDelay(delay, withTiming(target.translateY, { duration, easing }));
    translateX.value = withDelay(delay, withTiming(target.translateX, { duration, easing }));
    scale.value = withDelay(delay, withTiming(target.scale, { duration, easing }));

    if (target.width !== undefined) {
      width.value = withDelay(delay, withTiming(target.width, { duration, easing }));
    }

    if (target.rotate !== undefined) {
      rotate.value = withDelay(delay, withTiming(target.rotate, { duration, easing }));
    }
  }, [visible, final, delay]);

  const style = useAnimatedStyle(() => {
    const transforms: any[] = [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ];

    if (final.animate.rotate !== undefined || final.initial.rotate !== undefined) {
      transforms.push({ rotate: `${rotate.value}deg` });
    }

    const animStyle: any = {
      opacity: opacity.value,
      transform: transforms,
    };

    if (final.animate.width !== undefined || final.initial.width !== undefined) {
      animStyle.width = width.value;
    }

    return animStyle;
  });

  return { style };
};
