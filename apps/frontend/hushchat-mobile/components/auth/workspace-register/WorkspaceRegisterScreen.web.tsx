import React from "react";
import AuthWebLayout from "@/components/auth/AuthWebLayout";
import { WorkspaceRegisterForm } from "@/components/auth/workspace-register/WorkspaceRegisterForm";
import { useWorkspaceRegisterForm } from "@/hooks/auth/useWorkspaceRegisterForm";

export default function WorkspaceRegisterScreen() {
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useWorkspaceRegisterForm();

  return (
    <AuthWebLayout
      heroTitle="Register for workspace"
      heroSubtitle="Join your team workspace and start collaborating. It takes less than a minute."
    >
      <WorkspaceRegisterForm
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
