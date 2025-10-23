import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { bindExclusivity } from './helpers';
import { PLATFORM } from '@/constants/platformConstants';
import { ExternalGestures } from '@/types/gestures/types';

type TLongPressGestureProps = {
  enabled?: boolean;
  minDurationMs?: number;
  onStart?: () => void;
  onEnd?: () => void;
  simultaneousWith?: ExternalGestures;
  requireToFail?: ExternalGestures;
};

export function useLongPressGesture({
  enabled = true,
  minDurationMs = 300,
  onStart,
  onEnd,
  simultaneousWith,
  requireToFail,
}: TLongPressGestureProps) {
  const gesture = useMemo(() => {
    const g = Gesture.LongPress().enabled(enabled).minDuration(minDurationMs);

    if (PLATFORM.IS_WEB) g.runOnJS(true);

    g.onStart(() => {
      'worklet';
      if (onStart) scheduleOnRN(onStart);
    });

    g.onEnd(() => {
      'worklet';
      if (onEnd) scheduleOnRN(onEnd);
    });

    return bindExclusivity(g, simultaneousWith, requireToFail);
  }, [enabled, minDurationMs, onStart, onEnd, simultaneousWith, requireToFail]);

  return { gesture };
}
