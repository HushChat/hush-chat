import { MaterialIcons } from "@expo/vector-icons";
import Contact from "@/app/settings/contact";
import { FC } from "react";
import { getUserWorkspaces } from "@/apis/user";
import ChangeWorkspace from "@/app/settings/change-workspace";
import Invite from "@/app/settings/invite";

type TMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const baseMenuItems: TMenuItem[] = [
  { key: "contact", label: "Contact", icon: "contacts" },
  { key: "invite", label: "Invite", icon: "person-add" },
];

const changeWorkspaceItem: TMenuItem = {
  key: "changeWorkspace",
  label: "Change Workspace",
  icon: "track-changes",
};

export const getSettingsMenuItems = async (): Promise<TMenuItem[]> => {
  try {
    const response = await getUserWorkspaces();
    const workspaces = response.data || [];

    if (workspaces.length > 1) {
      return [...baseMenuItems, changeWorkspaceItem];
    }
    return baseMenuItems;
  } catch {
    return baseMenuItems;
  }
};

export const settingsPanels: Record<string, FC> = {
  contact: Contact,
  invite: Invite,
  changeWorkspace: ChangeWorkspace,
};
