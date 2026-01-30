import React from "react";
import { useRouter } from "expo-router";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";
import { WorkspaceRegisterForm } from "@/components/auth/workspace-register/WorkspaceRegisterForm";
import { useWorkspaceRegisterForm } from "@/hooks/auth/useWorkspaceRegisterForm";

export default function WorkspaceRegisterScreen() {
  const router = useRouter();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useWorkspaceRegisterForm();

  return (
    <AuthMobileLayout onBack={() => router.back()}>
      <WorkspaceRegisterForm
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
