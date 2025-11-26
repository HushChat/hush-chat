import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

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
  const { isDark } = useAppTheme();
  if (!hasMoreNewer) return <View className="h-4" />;

  return (
    <View className="py-4 items-center">
      <TouchableOpacity
        onPress={onLoadNewer}
        disabled={isFetchingNewer}
        className="flex-row space-x-2 bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-full items-center"
      >
        {isFetchingNewer ? (
          <ActivityIndicator size="small" color="#555" />
        ) : (
          <Ionicons name="arrow-down" size={16} color={isDark ? "#e5e7eb" : "#374151"} />
        )}

        <AppText className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {isFetchingNewer ? "Loading..." : "Load newer messages"}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};
