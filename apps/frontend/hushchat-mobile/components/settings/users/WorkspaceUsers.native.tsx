import React from "react";
import { ScrollView } from "react-native";
import { WorkspaceUsersList } from "@/components/settings/users/WorkspaceUsersList";

export function WorkspaceUsers() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <WorkspaceUsersList />
    </ScrollView>
  );
}
