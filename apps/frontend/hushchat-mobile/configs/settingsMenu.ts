import { MaterialIcons } from "@expo/vector-icons";
import Contact from "@/app/settings/contact";
import { FC } from "react";
import Invite from "@/app/settings/invite";

type TMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export const settingsMenuItems: TMenuItem[] = [
  { key: "contact", label: "Contact", icon: "contacts" },
  { key: "invite", label: "Invite", icon: "person-add" },
];

export const settingsPanels: Record<string, FC> = {
  contact: Contact,
  invite: Invite,
};
