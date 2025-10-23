import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { DEFAULT_ACTIVE_OPACITY } from '@/constants/ui';

interface TIconButtonProps {
  toggled?: boolean;
  disabled?: boolean;
  iconColor?: string;
  iconSize?: number;
  onPress?: () => void;
  className?: string;
}

const PrimaryCircularButton = ({
  toggled = false,
  disabled,
  iconColor = '#ffffff',
  iconSize = 18,
  onPress,
  className,
}: TIconButtonProps) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(toggled ? 1 : 0, {
      duration: 250,
      easing: Easing.inOut(Easing.ease),
    });
  }, [toggled, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${rotation.value * 135}deg`,
      },
    ],
  }));

  return (
    <TouchableOpacity
      className={`p-3 rounded-full bg-primary-light dark:bg-primary-dark ${className}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons name="add" size={iconSize} color={iconColor} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default PrimaryCircularButton;
