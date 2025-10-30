import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import { useWorkspaceForm } from "@/hooks/auth/useWorkspaceForm";
import WorkspaceForm from "@/components/auth/workspace/WorkspaceForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function WorkspaceScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, onValueChange, handleNext } =
    useWorkspaceForm();

  return (
    <AuthMobileLayout colors={colors} image={Images.Workspace}>
      <WorkspaceForm
        colors={colors}
        isDark={isDark}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        handleNext={handleNext}
      />
    </AuthMobileLayout>
  );
}
