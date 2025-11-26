import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import WorkspaceDropdown from "@/components/auth/workspace/WorkspaceDropdown";
import { getUserWorkspaces } from "@/apis/user";
import { useSaveWorkspace } from "@/hooks/auth/useSaveWorkspace";
import { logError } from "@/utils/logger";
import { Workspace } from "@/types/login/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PLATFORM } from "@/constants/platformConstants";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import { WORKSPACE } from "@/constants/constants";
import { StorageFactory } from "@/utils/storage/storageFactory";

export default function ChangeWorkspaceScreen() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { saveWorkspace } = useSaveWorkspace();
  const storage = StorageFactory.createStorage();

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentWorkspaceId = await storage.get(WORKSPACE);

        const response = await getUserWorkspaces();

        if (response.error) {
          setError(response.error);
          logError(response.error);
          return;
        }

        const fetchedWorkspaces = response.data || [];
        setWorkspaces(fetchedWorkspaces);

        if (currentWorkspaceId) {
          const current = fetchedWorkspaces.find(
            (w: any) => w.workspaceIdentifier === currentWorkspaceId
          );
          if (current) {
            setSelectedWorkspace(current);
          }
        }
      } catch (err) {
        logError("Error fetching workspaces:", err);
        setError("Failed to load workspaces. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const onSelectWorkspace = async (workspace: Workspace) => {
    setSelectedWorkspace(workspace);

    if (workspace.status === "ACCEPTED") {
      await saveWorkspace(workspace.workspaceIdentifier);
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

      {loading ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <>
          <View className="bg-gray-200 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="business-outline" size={20} color="#6b7280" />
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

          {error && (
            <View className="py-2 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg mt-4">
              <AppText className="text-red-600 dark:text-red-400 text-sm">{error}</AppText>
            </View>
          )}

          {selectedWorkspace?.status === "PENDING" && (
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
