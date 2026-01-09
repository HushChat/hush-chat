import { PLATFORM } from "@/constants/platformConstants";
import Users from "@/components/settings/users/Users";
import { Redirect } from "expo-router";
import SettingsWrapper from "@/components/settings/Settings";
import { RoleGuard, WorkspaceUserRole } from "@/app/guards/RoleGuard";

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
