import { TWorkspaceFormProps, Workspace, WorkspaceStatus } from "@/types/login/types";
import React, { useState } from "react";
import { FormButton, FormContainer, FormHeader, LinkText } from "@/components/FormComponents";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import WorkspaceDropdown from "@/components/auth/workspace/WorkspaceDropdown";
import { CHATS_PATH, WORKSPACE_CREATE_PATH, WORKSPACE_REGISTER_PATH } from "@/constants/routes";
import { useSaveWorkspace } from "@/hooks/auth/useSaveWorkspace";
import { useAuthStore } from "@/store/auth/authStore";
import { PLATFORM } from "@/constants/platformConstants";
import { useRouter } from "expo-router";
import { AppText } from "@/components/AppText";
import { useUserWorkspacesQuery } from "@/query/useUserWorkspacesQuery";

const WorkspaceForm = ({ colors, showErrors }: TWorkspaceFormProps) => {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const router = useRouter();
  const { saveWorkspace } = useSaveWorkspace();
  const { setWorkspaceSelected } = useAuthStore();
  const { workspaces, isLoadingWorkspaces, workspacesError } = useUserWorkspacesQuery();

  const onSelectWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
  };

  const handleNext = async () => {
    if (!selectedWorkspace) return;

    await saveWorkspace(selectedWorkspace?.workspaceIdentifier);
    setWorkspaceSelected(true);
    router.push(CHATS_PATH);
  };

  const onNavigateToRegister = async () => {
    await saveWorkspace(selectedWorkspace?.name);
    router.push(WORKSPACE_REGISTER_PATH);
  };

  const handleContinue = () => {
    if (!selectedWorkspace) return;

    if (selectedWorkspace.status === WorkspaceStatus.PENDING) {
      onNavigateToRegister();
    } else {
      handleNext();
    }
  };

  return (
    <FormContainer>
      <FormHeader
        title="Select a Workspace"
        subtitle="Choose your workspace to get started"
        colors={colors}
      />

      <View style={styles.formContainer}>
        <WorkspaceDropdown
          label="Workspace"
          placeholder="Select a workspace"
          workspaces={workspaces}
          selectedWorkspace={selectedWorkspace}
          onSelectWorkspace={onSelectWorkspace}
          showErrors={showErrors}
          errorKey="workspace"
          loading={isLoadingWorkspaces}
        />

        {workspacesError && (
          <View className="py-2 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AppText className="text-red-600 dark:text-red-400">
              {workspacesError.message || "Failed to load workspaces"}
            </AppText>
          </View>
        )}

        <FormButton
          title={
            selectedWorkspace?.status === WorkspaceStatus.PENDING
              ? "Continue to Registration"
              : "Next"
          }
          onPress={handleContinue}
          disabled={!selectedWorkspace || isLoadingWorkspaces}
          colors={colors}
        />

        <View className="gap-2 items-center">
          <LinkText
            text="Don't have a workspace?"
            linkText="Create one"
            colors={colors}
            onPress={() => router.push(WORKSPACE_CREATE_PATH)}
          />
          {!PLATFORM.IS_WEB && (
            <View className="flex-row items-center">
              <AppText className="text-base" style={{ color: colors.textSecondary }}>
                Use a different account?
              </AppText>

              <TouchableOpacity onPress={() => router.push("/login")}>
                <AppText className="ml-1 font-semibold underline" style={{ color: colors.primary }}>
                  Login
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </FormContainer>
  );
};

export default WorkspaceForm;

const styles = StyleSheet.create({
  formContainer: {
    flexDirection: "column",
    gap: 12,
  },
});
