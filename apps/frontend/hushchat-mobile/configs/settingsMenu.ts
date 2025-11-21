import { MaterialIcons } from "@expo/vector-icons";
import Contact from "@/app/settings/contact";
import { FC } from "react";

type TMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export const settingsMenuItems: TMenuItem[] = [
  { key: "contact", label: "Contact", icon: "contacts" },
];

export const settingsPanels: Record<string, FC> = {
  contact: Contact,
};
