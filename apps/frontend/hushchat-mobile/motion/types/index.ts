import { MotionPresets } from "@/motion/presets";
import { MotionEasing } from "@/motion/easing";

export type TMotionEasingName = keyof typeof MotionEasing;

export interface IMotionState {
  opacity: number;
  translateY: number;
  translateX: number;
  scale: number;
}

export interface IMotionPreset {
  initial: IMotionState;
  animate: IMotionState;
  duration: number;
  easing: any;
}

export type TMotionPresetName = keyof typeof MotionPresets;

export type TMotionEasing = TMotionEasingName | ((x: number) => number) | { enter: any; exit: any };

export interface IMotionOptions {
  preset?: TMotionPresetName;
  from?: Partial<IMotionState>;
  to?: Partial<IMotionState>;
  initial?: Partial<IMotionState>;
  animate?: Partial<IMotionState>;
  duration?: number | { enter: number; exit: number };
  easing?: TMotionEasing;
  delay?: number;
}
