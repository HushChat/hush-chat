import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { MotionView } from "@/motion/MotionView";

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
  return (
    <TouchableOpacity
      className={`p-3 rounded-full bg-primary-light dark:bg-primary-dark ${className}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
    >
      <MotionView
        visible={toggled}
        from={{ rotate: 0, opacity: 1 }}
        to={{ rotate: 135, opacity: 1 }}
        duration={250}
        easing="standard"
      >
        <Ionicons name="add" size={iconSize} color={iconColor} />
      </MotionView>
    </TouchableOpacity>
  );
};

export default PrimaryCircularButton;
