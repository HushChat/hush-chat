import React from "react";
import { View } from "react-native";
import { WorkspaceUsersList } from "@/components/settings/users/WorkspaceUsersList";

export function WorkspaceUsers() {
  return (
    <View className="flex-1 p-6">
      <WorkspaceUsersList />
    </View>
  );
}
