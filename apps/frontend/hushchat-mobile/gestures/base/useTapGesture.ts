import { useMemo } from "react";
import { Gesture } from "react-native-gesture-handler";
import { bindExclusivity } from "./helpers";
import { ExternalGestures } from "@/types/gestures/types";

type TTapGestureProps = {
  enabled?: boolean;
  numberOfTaps?: number;
  onStart?: () => void;
  onEnd?: () => void;
  simultaneousWith?: ExternalGestures;
  requireToFail?: ExternalGestures;
};

export function useTapGesture({
  enabled = true,
  numberOfTaps = 1,
  onStart,
  onEnd,
  simultaneousWith,
  requireToFail,
}: TTapGestureProps) {
  const gesture = useMemo(() => {
    const g = Gesture.Tap().enabled(enabled).numberOfTaps(numberOfTaps);

    if (onStart) g.onStart(onStart);
    if (onEnd) g.onEnd(onEnd);

    return bindExclusivity(g, simultaneousWith, requireToFail);
  }, [enabled, numberOfTaps, onStart, onEnd, simultaneousWith, requireToFail]);

  return { gesture };
}
