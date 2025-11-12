import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import AuthWebLayout from "@/components/auth/AuthWebLayout";
import { WorkspaceRegisterForm } from "@/components/auth/workspace-register/WorkspaceRegisterForm";
import { useWorkspaceRegisterForm } from "@/hooks/auth/useWorkspaceRegisterForm";

export default function WorkspaceRegisterScreen() {
  const { colors } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useWorkspaceRegisterForm();

  return (
    <AuthWebLayout
      colors={colors}
      title="Register for workspace"
      subtitle="Join your team workspace and start collaborating. It takes less than a minute."
      image={Images.Workspace}
    >
      <WorkspaceRegisterForm
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
