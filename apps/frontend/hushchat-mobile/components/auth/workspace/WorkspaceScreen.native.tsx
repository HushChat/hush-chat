import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import WorkspaceForm from "@/components/auth/workspace/WorkspaceForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function WorkspaceScreen() {
  const { colors, isDark } = useAuthThemeColors();

  return (
    <AuthMobileLayout colors={colors} isDark={isDark}>
      <WorkspaceForm colors={colors} isDark={isDark} showErrors={false} />
    </AuthMobileLayout>
  );
}
