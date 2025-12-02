import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";

interface ICharacterCounterProps {
  currentLength: number;
  maxChars: number;
}

export const CharacterCounter = ({ currentLength, maxChars }: ICharacterCounterProps) => {
  return (
    <View className="absolute bottom-0 right-2">
      <AppText className="text-xs text-gray-400">
        {currentLength}/{maxChars}
      </AppText>
    </View>
  );
};
