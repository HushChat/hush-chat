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
  allowedRoles: WorkspaceUserRole[];
};

type MenuBuilderContext = {
  workspaceCount?: number;
};

const baseMenuItems: TMenuItem[] = [
  {
    key: "contact",
    label: "Contact",
    icon: "contacts",
    allowedRoles: [WorkspaceUserRole.MEMBER, WorkspaceUserRole.ADMIN],
  },
  {
    key: "invite",
    label: "Invite",
    icon: "person-add",
    allowedRoles: [WorkspaceUserRole.MEMBER, WorkspaceUserRole.ADMIN],
  },
];

const changeWorkspaceItem: TMenuItem = {
  key: "changeWorkspace",
  label: "Change Workspace",
  icon: "track-changes",
  allowedRoles: [WorkspaceUserRole.MEMBER, WorkspaceUserRole.ADMIN],
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
    items = items.filter((item) => item.allowedRoles.includes(role));
  }

  return items;
};

export const settingsPanels: Record<string, FC> = {
  contact: Contact,
  invite: Invite,
  changeWorkspace: ChangeWorkspace,
};
