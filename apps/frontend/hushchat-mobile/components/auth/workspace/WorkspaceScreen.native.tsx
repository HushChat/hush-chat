import React from "react";
import WorkspaceForm from "@/components/auth/workspace/WorkspaceForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function WorkspaceScreen() {
  return (
    <AuthMobileLayout>
      <WorkspaceForm />
    </AuthMobileLayout>
  );
}
