import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";
import { CreateWorkspaceForm } from "@/components/auth/create-workspace/CreateWorkspaceForm";
import { useCreateWorkspaceForm } from "@/hooks/auth/useCreateWorkspaceForm";

export default function WorkspaceRegisterScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useCreateWorkspaceForm();

  return (
    <AuthMobileLayout colors={colors} isDark={isDark}>
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
    </AuthMobileLayout>
  );
}
