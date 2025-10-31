import type { GestureType } from "react-native-gesture-handler";

export type ExternalGestures = GestureType | GestureType[] | undefined;

export type Axis = "horizontal" | "vertical" | "free";

export type VelocityThresholds = {
  horizontal?: number;
  vertical?: number;
};

export type OffsetThresholds = {
  activeX?: [number, number];
  activeY?: [number, number];
  failX?: [number, number];
  failY?: [number, number];
};
