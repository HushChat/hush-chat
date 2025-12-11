import { MaterialIcons } from "@expo/vector-icons";
import Contact from "@/app/settings/contact";
import { FC } from "react";
import ChangeWorkspace from "@/app/settings/change-workspace";
import Invite from "@/app/settings/invite";
import { ALL_ROLES, WorkspaceUserRole } from "@/app/guards/RoleGuard";

type TMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  allowedRoles: WorkspaceUserRole[] | typeof ALL_ROLES;
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
  },
  {
    key: "invite",
    label: "Invite",
    icon: "person-add",
    allowedRoles: ALL_ROLES,
  },
];

const changeWorkspaceItem: TMenuItem = {
  key: "changeWorkspace",
  label: "Change Workspace",
  icon: "track-changes",
  allowedRoles: ALL_ROLES,
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
};
