import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import AuthWebLayout from "@/components/auth/AuthWebLayout";
import { CreateWorkspaceForm } from "@/components/auth/create-workspace/CreateWorkspaceForm";
import { useCreateWorkspaceForm } from "@/hooks/auth/useCreateWorkspaceForm";

export default function WorkspaceRegisterScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useCreateWorkspaceForm();

  return (
    <AuthWebLayout
      colors={colors}
      isDark={isDark}
      heroTitle="Build your team's home base."
      heroSubtitle="Create a dedicated space where your team can collaborate, share ideas, and get work done—all in one secure place."
      features={[]}
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
