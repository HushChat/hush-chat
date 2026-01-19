import React from "react";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";
import { CreateWorkspaceForm } from "@/components/auth/create-workspace/CreateWorkspaceForm";
import { useCreateWorkspaceForm } from "@/hooks/auth/useCreateWorkspaceForm";

export default function WorkspaceRegisterScreen() {
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useCreateWorkspaceForm();

  return (
    <AuthMobileLayout>
      <CreateWorkspaceForm
        errorMessage={errorMessage}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        onSubmit={submit}
        isLoading={isLoading}
      />
    </AuthMobileLayout>
  );
}
