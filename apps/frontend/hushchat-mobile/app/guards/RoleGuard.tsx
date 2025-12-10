import { AppText } from "@/components/AppText";
import { useUserStore } from "@/store/user/useUserStore";
import { View } from "react-native";

export enum WorkspaceUserRole {
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
}

type RoleGuardProps = {
  allowedRoles: WorkspaceUserRole[];
  children: React.ReactNode;
};

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isAuthenticatedAndDataFetched } = useUserStore();
  const workspaceRole = user?.workspaceRole;

  if (!isAuthenticatedAndDataFetched) return null;

  if (!workspaceRole || !allowedRoles.includes(workspaceRole)) {
    return (
      <View className="flex-1 justify-center item-center">
        <AppText>You do not have permission to access this screen.</AppText>
      </View>
    );
  }

  return <>{children}</>;
}
