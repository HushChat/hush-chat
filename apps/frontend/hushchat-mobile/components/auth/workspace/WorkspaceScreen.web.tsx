import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import WorkspaceForm from "@/components/auth/workspace/WorkspaceForm";
import { useWorkspaceForm } from "@/hooks/auth/useWorkspaceForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function WorkspaceScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, onValueChange, handleNext } = useWorkspaceForm();

  return (
    <AuthWebLayout
      colors={colors}
      title="Get Started!"
      subtitle="Set up your workspace and begin your journey."
      image={Images.Workspace}
    >
      <WorkspaceForm
        colors={colors}
        isDark={isDark}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        handleNext={handleNext}
      />
    </AuthWebLayout>
  );
}
