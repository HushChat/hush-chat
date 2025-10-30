/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import BackButton from "@/components/BackButton";
import { TUser } from "@/types/user/types";
import { UserMultiSelectList } from "@/components/UserMultiSelect";

export default function MobileParticipantSelection() {
  const insets = useSafeAreaInsets();
  const [selectedUsers, setSelectedUsers] = useState<TUser[]>([]);

  const goToGroupConfiguration = useCallback(() => {
    const ids = selectedUsers.map((u) => u.id);
    router.push({
      pathname: "/group-conversation/configure",
      params: { userIds: JSON.stringify(ids) },
    });
  }, [selectedUsers]);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="bg-white dark:bg-background-dark px-4 py-3 border-b border-gray-200 dark:border-gray-700"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <BackButton onPress={() => router.back()} />
            <Text className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
              Select Participants
            </Text>
          </View>
          <View className="flex-row gap-x-2">
            <TouchableOpacity
              onPress={goToGroupConfiguration}
              className={`px-4 py-2 rounded-lg ${
                selectedUsers.length > 0
                  ? "bg-primary-light dark:bg-primary-dark"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
              disabled={selectedUsers.length === 0}
            >
              <Text
                className={`font-medium ${
                  selectedUsers.length > 0
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <UserMultiSelectList
        selectedUsers={selectedUsers}
        onChange={setSelectedUsers}
      />
    </View>
  );
}
