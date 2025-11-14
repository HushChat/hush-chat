import React from "react";
import { useRouter } from "expo-router";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";
import { WorkspaceRegisterForm } from "@/components/auth/workspace-register/WorkspaceRegisterForm";
import { useWorkspaceRegisterForm } from "@/hooks/auth/useWorkspaceRegisterForm";

export default function WorkspaceRegisterScreen() {
  const { colors } = useAuthThemeColors();
  const router = useRouter();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useWorkspaceRegisterForm();

  return (
    <AuthMobileLayout colors={colors} image={Images.Workspace} onBack={() => router.back()}>
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
    </AuthMobileLayout>
  );
}
