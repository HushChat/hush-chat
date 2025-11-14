import React from "react";
import { useRouter } from "expo-router";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";
import { CreateWorkspaceForm } from "@/components/auth/create-workspace/CreateWorkspaceForm";
import { useCreateWorkspaceForm } from "@/hooks/auth/useCreateWorkspaceForm";

export default function WorkspaceRegisterScreen() {
  const { colors } = useAuthThemeColors();
  const router = useRouter();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useCreateWorkspaceForm();

  return (
    <AuthMobileLayout colors={colors} image={Images.Workspace} onBack={() => router.back()}>
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
