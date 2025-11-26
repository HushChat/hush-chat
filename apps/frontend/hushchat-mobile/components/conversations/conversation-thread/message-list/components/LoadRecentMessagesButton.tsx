import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

interface ILoadNewHeaderProps {
  onLoadNewer: () => void;
  hasMoreNewer: boolean;
  isFetchingNewer: boolean;
}

export const LoadRecentMessagesButton = ({
  onLoadNewer,
  hasMoreNewer,
  isFetchingNewer,
}: ILoadNewHeaderProps) => {
  if (!hasMoreNewer) return <View className="h-4" />;

  return (
    <View className="py-4 items-center">
      <TouchableOpacity
        onPress={onLoadNewer}
        disabled={isFetchingNewer}
        className="flex-row space-x-2 dark:bg-gray-800 px-4 py-2 rounded-full items-center"
      >
        {isFetchingNewer ? (
          <ActivityIndicator size="small" color="#555" />
        ) : (
          <Ionicons name="arrow-down" size={16} color="#fafafa" />
        )}

        <AppText className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {isFetchingNewer ? "Loading..." : "Load newer messages"}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};
