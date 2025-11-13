import { useEffect, useMemo } from "react";
import { useSharedValue, withTiming, withDelay, useAnimatedStyle } from "react-native-reanimated";

import { IMotionOptions, IMotionPreset, IMotionState, TMotionEasingName } from "@/motion/types";

import { MotionPresets } from "@/motion/presets";
import { MotionEasing } from "@/motion/easing";

/* ---------------------------------------------------------
 * 1. Default preset fallback
 * --------------------------------------------------------- */
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

/* ---------------------------------------------------------
 * 2. Duration normalizer
 * --------------------------------------------------------- */
const normalizeDuration = (duration: IMotionOptions["duration"], visible: boolean) => {
  if (typeof duration === "number") return duration;

  if (duration && typeof duration === "object") {
    return visible ? duration.enter : duration.exit;
  }

  return visible ? 300 : 250;
};

/* ---------------------------------------------------------
 * 3. Easing normalizer
 * --------------------------------------------------------- */
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

/* ---------------------------------------------------------
 * 4. Merge preset + overrides
 * --------------------------------------------------------- */
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
    },
    animate: {
      opacity: to.opacity ?? preset.animate.opacity,
      translateY: to.translateY ?? preset.animate.translateY,
      translateX: to.translateX ?? preset.animate.translateX,
      scale: to.scale ?? preset.animate.scale,
    },
    duration: normalizeDuration(opts.duration, visible),
    easing: normalizeEasing(opts.easing, visible),
  };
};

/* ---------------------------------------------------------
 * 5. MAIN HOOK — FINAL
 * --------------------------------------------------------- */
export const useMotion = (visible: boolean, opts: IMotionOptions = {}) => {
  const preset = opts.preset ? MotionPresets[opts.preset] : EMPTY_PRESET;

  const final = useMemo(() => mergeMotion(preset, opts, visible), [preset, opts, visible]);

  const delay = opts.delay ?? 0;

  const opacity = useSharedValue(final.initial.opacity);
  const translateY = useSharedValue(final.initial.translateY);
  const translateX = useSharedValue(final.initial.translateX);
  const scale = useSharedValue(final.initial.scale);

  useEffect(() => {
    const target = visible ? final.animate : final.initial;

    const easing = final.easing;
    const duration = final.duration;

    opacity.value = withDelay(delay, withTiming(target.opacity, { duration, easing }));

    translateY.value = withDelay(delay, withTiming(target.translateY, { duration, easing }));

    translateX.value = withDelay(delay, withTiming(target.translateX, { duration, easing }));

    scale.value = withDelay(delay, withTiming(target.scale, { duration, easing }));
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return { style };
};
