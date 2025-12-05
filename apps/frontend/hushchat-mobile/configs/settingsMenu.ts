import { MaterialIcons } from "@expo/vector-icons";
import Contact from "@/app/settings/contact";
import { FC } from "react";
import ChangeWorkspace from "@/app/settings/change-workspace";
import Invite from "@/app/settings/invite";
import Users from "@/app/settings/users";

type TMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

type MenuBuilderContext = {
  workspaceCount?: number;
};

const baseMenuItems: TMenuItem[] = [
  { key: "contact", label: "Contact", icon: "contacts" },
  { key: "users", label: "Users", icon: "people" },
  { key: "invite", label: "Invite", icon: "person-add" },
];

const changeWorkspaceItem: TMenuItem = {
  key: "changeWorkspace",
  label: "Change Workspace",
  icon: "track-changes",
};

export const getSettingsMenuItems = (context: MenuBuilderContext): TMenuItem[] => {
  const items = [...baseMenuItems];

  if (context.workspaceCount && context.workspaceCount > 1) {
    items.push(changeWorkspaceItem);
  }

  return items;
};

export const settingsPanels: Record<string, FC> = {
  contact: Contact,
  users: Users,
  invite: Invite,
  changeWorkspace: ChangeWorkspace,
};
