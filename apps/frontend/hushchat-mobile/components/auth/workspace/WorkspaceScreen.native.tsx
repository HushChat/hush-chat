import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import WorkspaceForm from "@/components/auth/workspace/WorkspaceForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function WorkspaceScreen() {
  const { colors, isDark } = useAuthThemeColors();

  return (
    <AuthMobileLayout colors={colors} image={Images.Workspace}>
      <WorkspaceForm colors={colors} isDark={isDark} showErrors={false} />
    </AuthMobileLayout>
  );
}
