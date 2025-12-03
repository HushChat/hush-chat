import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import WorkspaceDropdown from "@/components/auth/workspace/WorkspaceDropdown";
import { useSaveWorkspace } from "@/hooks/auth/useSaveWorkspace";
import { Workspace, WorkspaceStatus } from "@/types/login/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PLATFORM } from "@/constants/platformConstants";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import { WORKSPACE } from "@/constants/constants";
import { StorageFactory } from "@/utils/storage/storageFactory";
import { useQueryClient } from "@tanstack/react-query";
import { useUserWorkspacesQuery } from "@/query/useUserWorkspacesQuery";

export default function ChangeWorkspaceScreen() {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const { saveWorkspace } = useSaveWorkspace();
  const storage = StorageFactory.createStorage();
  const queryClient = useQueryClient();

  const insets = useSafeAreaInsets();

  const { workspaces, isLoadingWorkspaces, workspacesError } = useUserWorkspacesQuery();

  useEffect(() => {
    const initializeSelection = async () => {
      if (workspaces.length > 0 && !selectedWorkspace) {
        const currentWorkspaceId = await storage.get(WORKSPACE);

        if (currentWorkspaceId) {
          const current = workspaces.find((w) => w.workspaceIdentifier === currentWorkspaceId);
          if (current) {
            setSelectedWorkspace(current);
          }
        }
      }
    };

    initializeSelection();
  }, [workspaces]);

  const onSelectWorkspace = async (workspace: Workspace) => {
    if (workspace.workspaceIdentifier === selectedWorkspace?.workspaceIdentifier) {
      return;
    }
    setSelectedWorkspace(workspace);

    if (workspace.status === WorkspaceStatus.ACCEPTED) {
      await saveWorkspace(workspace.workspaceIdentifier);
      await queryClient.invalidateQueries();
    }
  };

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark px-4"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center mb-2">
        {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
        <AppText className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
          Change Workspace
        </AppText>
      </View>

      <AppText className="text-gray-600 dark:text-gray-400 max-w-[600px] mb-6">
        Switch between your workspaces to access different environments.
      </AppText>

      {isLoadingWorkspaces ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <View className="bg-gray-200 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="create-sharp" size={20} color="#6b7280" />
              <AppText className="text-text-primary-light dark:text-text-primary-dark ml-3 text-sm">
                Current: {selectedWorkspace?.name || "No workspace selected"}
              </AppText>
            </View>
          </View>

          <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Select Workspace
          </AppText>

          <WorkspaceDropdown
            label=""
            placeholder="Select a workspace"
            workspaces={workspaces}
            selectedWorkspace={selectedWorkspace}
            onSelectWorkspace={onSelectWorkspace}
            showErrors={false}
            errorKey="workspace"
            loading={false}
          />

          {workspacesError && (
            <View className="py-2 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg mt-4">
              <AppText className="text-red-600 dark:text-red-400 text-sm">
                {workspacesError.message || "Failed to load workspaces."}
              </AppText>
            </View>
          )}

          {selectedWorkspace?.status === WorkspaceStatus.PENDING && (
            <View className="py-2 px-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mt-4">
              <AppText className="text-yellow-700 dark:text-yellow-400 text-sm">
                This workspace is pending approval. You cannot switch to it yet.
              </AppText>
            </View>
          )}
        </>
      )}
    </View>
  );
}
