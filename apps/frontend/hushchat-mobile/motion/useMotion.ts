import { useEffect, useMemo } from "react";
import { useSharedValue, withTiming, withDelay, useAnimatedStyle } from "react-native-reanimated";
import { IMotionOptions, IMotionPreset, IMotionState, TMotionEasingName } from "@/motion/types";
import { MotionPresets } from "@/motion/presets";
import { MotionEasing } from "@/motion/easing";

const EMPTY_PRESET: IMotionPreset = {
  initial: {
    opacity: 1,
    translateY: 0,
    translateX: 0,
    scale: 1,
  },
  animate: {
    opacity: 1,
    translateY: 0,
    translateX: 0,
    scale: 1,
  },
  duration: 250,
  easing: MotionEasing.standard,
};

const normalizeDuration = (duration: IMotionOptions["duration"], visible: boolean) => {
  if (typeof duration === "number") return duration;

  if (duration && typeof duration === "object") {
    return visible ? duration.enter : duration.exit;
  }

  return visible ? 300 : 250;
};

const resolveEasingToken = (token: TMotionEasingName | any) => {
  if (typeof token === "string") {
    return MotionEasing[token as TMotionEasingName];
  }
  return token;
};

const normalizeEasing = (easing: any, visible: boolean) => {
  if (typeof easing === "function" || typeof easing === "string") {
    return resolveEasingToken(easing);
  }

  if (typeof easing === "object") {
    const selected = visible ? easing.enter : easing.exit;
    return resolveEasingToken(selected);
  }

  return MotionEasing.standard;
};

const mergeMotion = (
  preset: IMotionPreset,
  opts: IMotionOptions,
  visible: boolean
): IMotionPreset => {
  const from: Partial<IMotionState> = opts.from ?? opts.initial ?? preset.initial;
  const to: Partial<IMotionState> = opts.to ?? opts.animate ?? preset.animate;

  return {
    initial: {
      opacity: from.opacity ?? preset.initial.opacity,
      translateY: from.translateY ?? preset.initial.translateY,
      translateX: from.translateX ?? preset.initial.translateX,
      scale: from.scale ?? preset.initial.scale,
      width: from.width ?? preset.initial.width,
      rotate: from.rotate ?? preset.initial.rotate,
    },
    animate: {
      opacity: to.opacity ?? preset.animate.opacity,
      translateY: to.translateY ?? preset.animate.translateY,
      translateX: to.translateX ?? preset.animate.translateX,
      scale: to.scale ?? preset.animate.scale,
      width: to.width ?? preset.animate.width,
      rotate: to.rotate ?? preset.animate.rotate,
    },
    duration: normalizeDuration(opts.duration, visible),
    easing: normalizeEasing(opts.easing, visible),
  };
};

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
