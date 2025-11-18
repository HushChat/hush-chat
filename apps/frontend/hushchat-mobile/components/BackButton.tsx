import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

interface BackButtonProps {
  onPress: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress }) => {
  const { isDark } = useAppTheme();
  const iconColor = isDark ? "#FAFAFA" : "#1A1A1A";
  return (
    <TouchableOpacity onPress={onPress} className="p-2 mr-2">
      <Ionicons name="arrow-back-outline" size={20} color={iconColor} />
    </TouchableOpacity>
  );
};

export default BackButton;
