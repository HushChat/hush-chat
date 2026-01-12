import { Redirect } from "expo-router";

import { RoleGuard, WorkspaceUserRole } from "@/app/guards/RoleGuard";
import SettingsWrapper from "@/components/settings/Settings";
import Users from "@/components/settings/users/Users";
import { PLATFORM } from "@/constants/platformConstants";

export default function UsersIndex() {
  if (!PLATFORM.IS_WEB) {
    return <Redirect href="/(tabs)/settings/users/list" />;
  }

  return (
    <RoleGuard allowedRoles={[WorkspaceUserRole.ADMIN]}>
      <SettingsWrapper>
        <Users />
      </SettingsWrapper>
    </RoleGuard>
  );
}
