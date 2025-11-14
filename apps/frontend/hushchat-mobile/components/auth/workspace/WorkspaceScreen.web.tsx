import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import WorkspaceForm from "@/components/auth/workspace/WorkspaceForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function WorkspaceScreen() {
  const { colors, isDark } = useAuthThemeColors();

  return (
    <AuthWebLayout
      colors={colors}
      title="Get Started!"
      subtitle="Set up your workspace and begin your journey."
      image={Images.Workspace}
    >
      <WorkspaceForm colors={colors} isDark={isDark} showErrors={false} />
    </AuthWebLayout>
  );
}
