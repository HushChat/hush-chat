import { TWorkspaceFormProps, Workspace } from "@/types/login/types";
import React, { useEffect, useState } from "react";
import { FormButton, FormContainer, FormHeader, LinkText } from "@/components/FormComponents";
import { StyleSheet, View, Text } from "react-native";
import WorkspaceDropdown from "@/components/auth/workspace/WorkspaceDropdown";
import { getUserWorkspaces } from "@/apis/user";
import { useRouter } from "expo-router";
import { CHATS_PATH, WORKSPACE_CREATE_PATH, WORKSPACE_REGISTER_PATH } from "@/constants/routes";
import { useSaveWorkspace } from "@/hooks/auth/useSaveWorkspace";
import { useAuthStore } from "@/store/auth/authStore";
import { logError } from "@/utils/logger";

const WorkspaceForm = ({ colors, showErrors }: TWorkspaceFormProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { saveWorkspace } = useSaveWorkspace();
  const { setWorkspaceSelected } = useAuthStore();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getUserWorkspaces();

        if (response.error) {
          setError(response.error);
          logError(response.error);
          return;
        }

        setWorkspaces(response.data || []);
      } catch (err) {
        logError("Error fetching workspaces:", err);
        setError("Failed to load workspaces. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const onSelectWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
  };

  const handleNext = async () => {
    if (!selectedWorkspace) return;

    await saveWorkspace(selectedWorkspace?.name);
    setWorkspaceSelected(true);
    router.push(CHATS_PATH);
  };

  const onNavigateToRegister = async () => {
    await saveWorkspace(selectedWorkspace?.name);
    router.push(WORKSPACE_REGISTER_PATH);
  };

  const handleContinue = () => {
    if (!selectedWorkspace) return;

    if (selectedWorkspace.status === "PENDING") {
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
          loading={loading}
        />

        {error && (
          <View className="py-2 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <Text className="text-red-600 dark:text-red-400">{error}</Text>
          </View>
        )}

        <FormButton
          title={selectedWorkspace?.status === "PENDING" ? "Continue to Registration" : "Next"}
          onPress={handleContinue}
          disabled={!selectedWorkspace || loading}
          colors={colors}
        />

        <LinkText
          text="Don't have workspace?"
          linkText="Create"
          colors={colors}
          onPress={() => router.push(WORKSPACE_CREATE_PATH)}
        />
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
