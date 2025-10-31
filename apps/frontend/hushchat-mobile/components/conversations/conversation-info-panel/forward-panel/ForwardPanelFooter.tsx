import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

interface ForwardPanelFooterProps {
  isPending: boolean;
  canSend: boolean;
  selectedCount: number;
  onCancel: () => void;
  onSend: () => void;
}

export const ForwardPanelFooter = ({
  isPending,
  canSend,
  selectedCount,
  onCancel,
  onSend,
}: ForwardPanelFooterProps) => {
  return (
    <View className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex-row justify-end gap-2">
      <TouchableOpacity
        onPress={onCancel}
        className="px-4 py-2 rounded-lg bg-secondary-light dark:bg-secondary-dark"
        disabled={isPending}
      >
        <Text className="text-gray-800 dark:text-gray-200">Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSend}
        disabled={!canSend}
        className={`px-4 py-2 rounded-lg ${
          canSend ? "bg-primary-light dark:bg-primary-dark" : "bg-gray-300 dark:bg-gray-700"
        } flex-row items-center`}
      >
        {isPending && <ActivityIndicator size="small" color="#fff" className="mr-2" />}
        <Text className="text-white">
          {isPending ? "Sending…" : `Send to ${selectedCount || ""}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
