import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AppText } from "@/components/AppText";
import LoadingState from "@/components/LoadingState";

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
    <View className="mt-5 px-4 mb-4">
      <View className="max-w-3xl w-full mx-auto">
        <TouchableOpacity
          onPress={onUpdate}
          disabled={isUpdateDisabled}
          className={`py-4 rounded-lg items-center mb-3 ${
            !isUpdateDisabled
              ? "bg-primary-light dark:bg-primary-dark"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          {isLoading ? (
            <LoadingState />
          ) : (
            <AppText className="text-white text-base font-semibold">Update</AppText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLogout}
          disabled={isLoading}
          className="border border-red-500 dark:border-red-400 py-4 rounded-lg items-center"
        >
          <AppText className="text-red-500 dark:text-red-400 text-base font-semibold">
            Logout
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
