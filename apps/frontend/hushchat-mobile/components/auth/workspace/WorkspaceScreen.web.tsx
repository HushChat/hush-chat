import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import WorkspaceForm from "@/components/auth/workspace/WorkspaceForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function WorkspaceScreen() {
  const { colors, isDark } = useAuthThemeColors();

  return (
    <AuthWebLayout
      colors={colors}
      isDark={isDark}
      heroTitle={`One account,\nmultiple workspaces.`}
      heroSubtitle="Keep your personal and work conversations organized. Each workspace has its own channels, members, and settings."
      features={[
        { icon: "shield-checkmark-outline", text: "Separate spaces for different teams" },
        { icon: "person-outline", text: "Independent settings per workspace" },
        { icon: "chatbubbles-outline", text: "Invite members to any workspace" },
      ]}
    >
      <WorkspaceForm colors={colors} isDark={isDark} showErrors={false} />
    </AuthWebLayout>
  );
}
