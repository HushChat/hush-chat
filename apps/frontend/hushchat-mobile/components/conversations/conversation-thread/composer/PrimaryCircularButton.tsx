/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

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
  iconColor = "#ffffff",
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
