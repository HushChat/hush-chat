import { Workspace, WorkspaceStatus } from "@/types/login/types";
import React, { useState } from "react";
import { FormButton, FormContainer, FormHeader } from "@/components/FormComponents";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import WorkspaceDropdown from "@/components/auth/workspace/WorkspaceDropdown";
import { CHATS_PATH, WORKSPACE_CREATE_PATH, WORKSPACE_REGISTER_PATH } from "@/constants/routes";
import { useSaveWorkspace } from "@/hooks/auth/useSaveWorkspace";
import { useAuthStore } from "@/store/auth/authStore";
import { useRouter } from "expo-router";
import { AppText } from "@/components/AppText";
import { useUserWorkspacesQuery } from "@/query/useUserWorkspacesQuery";
import { ToastUtils } from "@/utils/toastUtils";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";

const WorkspaceForm = () => {
  const { colors } = useAuthThemeColors();
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
    await saveWorkspace(selectedWorkspace?.workspaceIdentifier);
    router.push(WORKSPACE_REGISTER_PATH);
  };

  const handleContinue = () => {
    if (!selectedWorkspace) return;

    if (selectedWorkspace.status === WorkspaceStatus.PENDING) {
      onNavigateToRegister();
    } else if (selectedWorkspace.status === WorkspaceStatus.SUSPENDED) {
      ToastUtils.error("Your access to this workspace has been suspended. Please contact support.");
    } else {
      handleNext();
    }
  };

  return (
    <FormContainer>
      <FormHeader
        title="Choose a workspace"
        subtitle="Select a workspace to continue, or create a new one for your team"
        colors={colors}
      />

      <View style={styles.formContainer}>
        <WorkspaceDropdown
          label="Workspace"
          placeholder="Select a workspace"
          workspaces={workspaces}
          selectedWorkspace={selectedWorkspace}
          onSelectWorkspace={onSelectWorkspace}
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
              : "Continue"
          }
          onPress={handleContinue}
          disabled={!selectedWorkspace || isLoadingWorkspaces}
          colors={colors}
        />

        <View style={styles.separatorContainer}>
          <AppText style={[styles.separatorText, { color: colors.textSecondary }]}>or</AppText>
        </View>

        <TouchableOpacity
          style={[styles.createButton, { borderColor: colors.primary }]}
          onPress={() => router.push(WORKSPACE_CREATE_PATH)}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
        >
          <AppText style={[styles.createButtonText, { color: colors.primary }]}>
            + Create new workspace
          </AppText>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <AppText style={[styles.footerText, { color: colors.textSecondary }]}>Not you? </AppText>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <AppText style={[styles.footerLink, { color: colors.primary }]}>
              Sign in with a different account
            </AppText>
          </TouchableOpacity>
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
  separatorContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  separatorText: {
    fontSize: 14,
  },
  createButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
