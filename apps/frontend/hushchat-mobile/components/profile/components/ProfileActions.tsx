import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AppText } from "@/components/AppText";
import LoadingState from "@/components/LoadingState";

interface ProfileActionsProps {
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
}: ProfileActionsProps) {
  return (
    <View className="mt-6 px-4">
      <View className="max-w-3xl w-full mx-auto">
        <TouchableOpacity
          onPress={onUpdate}
          disabled={isUpdateDisabled}
          className={`py-4 rounded-xl items-center mb-3 ${
            !isUpdateDisabled ? "bg-blue-500" : "bg-gray-400"
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
          className="bg-red-500 py-4 rounded-xl items-center"
        >
          <AppText className="text-white text-base font-semibold">Logout</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
