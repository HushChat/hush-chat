import { IMotionPreset } from "@/motion/types";
import { MotionConfig } from "@/motion/config";

export const MotionPresets = {
  fadeIn: {
    initial: {
      opacity: 0,
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
    duration: MotionConfig.duration.md,
    easing: MotionConfig.easing.smooth,
  },

  slideUp: {
    initial: {
      opacity: 0,
      translateY: 20,
      translateX: 0,
      scale: 1,
    },
    animate: {
      opacity: 1,
      translateY: 0,
      translateX: 0,
      scale: 1,
    },
    duration: MotionConfig.duration.md,
    easing: MotionConfig.easing.smooth,
  },

  scaleIn: {
    initial: {
      opacity: 0,
      translateY: 0,
      translateX: 0,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      translateY: 0,
      translateX: 0,
      scale: 1,
    },
    duration: MotionConfig.duration.md,
    easing: MotionConfig.easing.swift,
  },
} satisfies Record<string, IMotionPreset>;
