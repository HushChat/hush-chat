import React, { useCallback, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/BackButton";
import { TUser } from "@/types/user/types";
import { UserMultiSelectList } from "@/components/UserMultiSelect";
import { AppText } from "@/components/AppText";

export default function MobileParticipantSelection() {
  const insets = useSafeAreaInsets();
  const [selectedUsers, setSelectedUsers] = useState<TUser[]>([]);
  const [addAllUsers, setAddAllUsers] = useState(false);

  const canContinue = addAllUsers || selectedUsers.length > 0;

  const goToGroupConfiguration = useCallback(() => {
    const ids = selectedUsers.map((u) => u.id);
    router.push({
      pathname: "/group-conversation/configure",
      params: {
        userIds: JSON.stringify(ids),
        ...(addAllUsers ? { addAllWorkspaceUsers: "true" } : {}),
      },
    });
  }, [selectedUsers, addAllUsers]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="bg-white dark:bg-background-dark px-4 py-3 border-b border-gray-200 dark:border-gray-700"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <BackButton onPress={() => router.back()} />
            <AppText className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
              Select Participants
            </AppText>
          </View>
          <View className="flex-row gap-x-2">
            <TouchableOpacity
              onPress={goToGroupConfiguration}
              className={`px-4 py-2 rounded-lg ${
                canContinue
                  ? "bg-primary-light dark:bg-primary-dark"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
              disabled={!canContinue}
            >
              <AppText
                className={`font-medium ${
                  canContinue ? "text-white" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Continue
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setAddAllUsers((prev) => !prev)}
        className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-700"
      >
        <View className="flex-row items-center">
          <Ionicons name="people" size={20} color="#6B7280" />
          <AppText className="ml-3 text-base text-gray-900 dark:text-white">
            Add all workspace users
          </AppText>
        </View>
        <Ionicons
          name={addAllUsers ? "checkbox" : "square-outline"}
          size={22}
          color={addAllUsers ? "#3B82F6" : "#9CA3AF"}
        />
      </TouchableOpacity>

      {addAllUsers ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="people-circle-outline" size={48} color="#9CA3AF" />
          <AppText className="mt-3 text-center text-gray-500 dark:text-gray-400">
            All workspace users will be added to this group
          </AppText>
        </View>
      ) : (
        <UserMultiSelectList selectedUsers={selectedUsers} onChange={setSelectedUsers} />
      )}
    </View>
  );
}
