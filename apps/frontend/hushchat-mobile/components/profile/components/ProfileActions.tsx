import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

interface IProfileActionsProps {
  onUpdate: () => void;
  onLogout: () => void;
  isUpdateDisabled: boolean;
  isLoading: boolean;
}

export function ProfileActions({
  onUpdate,
  onLogout,
  isUpdateDisabled,
  isLoading,
}: IProfileActionsProps) {
  return (
    <View className="mt-6 px-4">
      <View className="max-w-3xl w-full mx-auto gap-3">
        <TouchableOpacity
          onPress={onUpdate}
          disabled={isUpdateDisabled}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
          className={`py-4 rounded-lg items-center ${
            !isUpdateDisabled
              ? "bg-primary-light dark:bg-primary-dark"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" size={20} />
          ) : (
            <AppText className="text-white text-base font-semibold">Update Profile</AppText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLogout}
          disabled={isLoading}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
          className="border border-red-500 py-4 rounded-lg items-center"
        >
          <AppText className="text-red-500 text-base font-semibold">Logout</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
