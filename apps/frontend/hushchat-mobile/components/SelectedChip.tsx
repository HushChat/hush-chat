import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_HIT_SLOP } from "@/constants/ui";
import { PLATFORM } from "@/constants/platformConstants";

interface SelectedChipProps {
  label: string;
  onRemove: () => void;
}

export const SelectedChip = ({ label, onRemove }: SelectedChipProps) => (
  <View
    className={`flex-row items-center bg-primary-light dark:bg-primary-dark/50 ${
      PLATFORM.IS_WEB ? "px-3 py-1.5 mr-2 mb-3" : "px-3 py-2 mr-2 mb-2"
    } rounded-full`}
  >
    <Text
      className={`text-white text-sm font-medium ${PLATFORM.IS_WEB ? "mr-1.5" : "mr-2"}`}
    >
      {label}
    </Text>
    <TouchableOpacity onPress={onRemove} hitSlop={DEFAULT_HIT_SLOP}>
      <Ionicons
        name="close-circle"
        size={PLATFORM.IS_WEB ? 14 : 16}
        color="white"
      />
    </TouchableOpacity>
  </View>
);
