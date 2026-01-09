import { MaterialIcons } from "@expo/vector-icons";
import { FC } from "react";
import { ALL_ROLES, WorkspaceUserRole } from "@/app/guards/RoleGuard";
import Contact from "@/app/(tabs)/settings/contact";
import Invite from "@/app/(tabs)/settings/invite";
import ChangeWorkspace from "@/app/(tabs)/settings/change-workspace";
import UsersIndex from "@/app/(tabs)/settings/users";

type TMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  allowedRoles: WorkspaceUserRole[] | typeof ALL_ROLES;
  route: string;
};

type MenuBuilderContext = {
  workspaceCount?: number;
};

const baseMenuItems: TMenuItem[] = [
  {
    key: "contact",
    label: "Contact",
    icon: "contacts",
    allowedRoles: ALL_ROLES,
    route: "/settings/contact",
  },
  {
    key: "invite",
    label: "Invite",
    icon: "person-add",
    allowedRoles: ALL_ROLES,
    route: "/settings/invite",
  },
  {
    key: "users",
    label: "Users",
    icon: "people",
    allowedRoles: [WorkspaceUserRole.ADMIN],
    route: "/settings/users",
  },
];

const changeWorkspaceItem: TMenuItem = {
  key: "changeWorkspace",
  label: "Change Workspace",
  icon: "track-changes",
  allowedRoles: ALL_ROLES,
  route: "/settings/change-workspace",
};

export const getSettingsMenuItems = (
  context: MenuBuilderContext,
  role?: WorkspaceUserRole | null
): TMenuItem[] => {
  let items = [...baseMenuItems];

  if (context.workspaceCount && context.workspaceCount > 1) {
    items.push(changeWorkspaceItem);
  }

  if (role) {
    items = items.filter((item) => {
      if (item.allowedRoles === ALL_ROLES) return true;
      return item.allowedRoles.includes(role);
    });
  }

  return items;
};

export const settingsPanels: Record<string, FC> = {
  contact: Contact,
  invite: Invite,
  changeWorkspace: ChangeWorkspace,
  users: UsersIndex,
};