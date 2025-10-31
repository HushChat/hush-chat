import { View, TouchableOpacity, GestureResponderEvent } from "react-native";
import React, { RefObject } from "react";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ChevronButtonProps {
  chevronButtonRef: RefObject<View | null>;
  handleOptionsPress: (e: GestureResponderEvent) => void;
}

const ChevronButton = ({
  chevronButtonRef,
  handleOptionsPress,
}: ChevronButtonProps) => {
  const { isDark } = useAppTheme();
  return (
    <TouchableOpacity
      ref={chevronButtonRef}
      onPress={handleOptionsPress}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      className="p-1 ml-1 opacity-0 group-hover:opacity-100"
    >
      <View className="w-4 h-4 items-center justify-center dark:bg-primary">
        <Ionicons
          name="chevron-down"
          size={20}
          color={isDark ? "#9ca3af" : "#6B7280"}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ChevronButton;
