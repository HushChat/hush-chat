import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BackButtonProps {
  onPress: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="p-2 mr-2">
      <Ionicons name="arrow-back-outline" size={20} color="#3B82F6" />
    </TouchableOpacity>
  );
};

export default BackButton;
