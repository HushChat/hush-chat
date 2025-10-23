import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { bindExclusivity } from './helpers';
import { ExternalGestures } from '@/types/gestures/types';

type Props = {
  enabled?: boolean;
  onChange?: (radians: number) => void;
  simultaneousWith?: ExternalGestures;
  requireToFail?: ExternalGestures;
};

export function useRotateGesture({
  enabled = true,
  onChange,
  simultaneousWith,
  requireToFail,
}: Props) {
  const rotation = useSharedValue(0);

  const gesture = useMemo(() => {
    const g = Gesture.Rotation()
      .enabled(enabled)
      .onUpdate((e) => {
        rotation.value = e.rotation;
        onChange?.(rotation.value);
      });

    return bindExclusivity(g, simultaneousWith, requireToFail);
  }, [enabled, simultaneousWith, requireToFail, rotation, onChange]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(rotation.value * 180) / Math.PI}deg` }],
  }));

  return { gesture, rotation, animatedStyle };
}
