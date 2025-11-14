import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import AuthWebLayout from "@/components/auth/AuthWebLayout";
import { CreateWorkspaceForm } from "@/components/auth/create-workspace/CreateWorkspaceForm";
import { useCreateWorkspaceForm } from "@/hooks/auth/useCreateWorkspaceForm";

export default function WorkspaceRegisterScreen() {
  const { colors } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useCreateWorkspaceForm();

  return (
    <AuthWebLayout
      colors={colors}
      title="Create new workspace"
      subtitle="Join your team workspace and start collaborating. It takes less than a minute."
      image={Images.Workspace}
    >
      <CreateWorkspaceForm
        colors={colors}
        errorMessage={errorMessage}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        onSubmit={submit}
        isLoading={isLoading}
      />
    </AuthWebLayout>
  );
}
