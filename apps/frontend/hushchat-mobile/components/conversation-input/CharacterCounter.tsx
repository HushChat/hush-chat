/**
 * CharacterCounter
 *
 * Displays current character count vs maximum.
 */

import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";

interface CharacterCounterProps {
  currentLength: number;
  maxChars: number;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({ currentLength, maxChars }) => {
  return (
    <View className="absolute bottom-0 right-2">
      <AppText className="text-xs text-gray-400">
        {currentLength}/{maxChars}
      </AppText>
    </View>
  );
};
