import { MaterialIcons } from "@expo/vector-icons";
import Contact from "@/app/settings/contact";
import { FC } from "react";
import ChangeWorkspace from "@/app/settings/change-workspace";
import Invite from "@/app/settings/invite";
import { WorkspaceUserRole } from "@/app/guards/RoleGuard";

type TMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  adminOnly: boolean;
};

type MenuBuilderContext = {
  workspaceCount?: number;
};

const baseMenuItems: TMenuItem[] = [
  { key: "contact", label: "Contact", icon: "contacts", adminOnly: false },
  { key: "invite", label: "Invite", icon: "person-add", adminOnly: false },
  { key: "users", label: "Manage Users", icon: "person-add", adminOnly: true },
];

const changeWorkspaceItem: TMenuItem = {
  key: "changeWorkspace",
  label: "Change Workspace",
  icon: "track-changes",
  adminOnly: false,
};

export const getSettingsMenuItems = (
  context: MenuBuilderContext,
  role?: WorkspaceUserRole | null
): TMenuItem[] => {
  let items = [...baseMenuItems];

  if (context.workspaceCount && context.workspaceCount > 1) {
    items.push(changeWorkspaceItem);
  }

  if (role !== WorkspaceUserRole.ADMIN) {
    items = items.filter((item) => !item.adminOnly);
  }

  return items;
};

export const settingsPanels: Record<string, FC> = {
  contact: Contact,
  invite: Invite,
  changeWorkspace: ChangeWorkspace,
};
